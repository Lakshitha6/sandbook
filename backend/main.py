from os import name
from sqlalchemy import desc, or_
from fastapi import FastAPI, Depends, status, HTTPException
import models,utils, oauth
from database import engine, get_db
from sqlalchemy.orm import Session
from schemas import Create_User, Return_User, Create_Post, Response_Post, getAllUsers, Friend_Requests, Friend_Response, Friend_Request_Detail, FriendStatus, FriendPost
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

models.Base.metadata.create_all(bind = engine)


app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "http://localhost:3000",
    "https://1jh3cnh2-3000.asse.devtunnels.ms/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"root": "this is the root endpoint"}


@app.post("/createUser")
def create_user(new_user: Create_User, db: Session = Depends(get_db)):

    # Hash the password before storing it
    hashed_password = utils.hash_password(new_user.password)
    new_user.password = hashed_password

    created_user = models.User(**new_user.model_dump())
    db.add(created_user)
    db.commit()
    db.refresh(created_user)
    returned_user = Return_User.model_validate(created_user)

    return returned_user


@app.post("/login")
def login_user(login_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user  = db.query(models.User).filter(models.User.email == login_data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid email or password"
        )

    if not utils.verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid email or password"
        )

    access_token  = oauth.create_access_token(data={"user_id": user.id})

    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/getUserData", response_model=Return_User)
def get_user_details(db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):
    user_details = db.query(models.User).filter(models.User.id == current_user.id).first()
    return user_details

@app.post("/createPosts")
def create_post(new_post: Create_Post, db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):
    post = models.Post(user_id=current_user.id, **new_post.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@app.get("/getAllPostsById", response_model=list[Response_Post])
def get_posts_list(db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):
    posts = db.query(models.Post).filter(models.Post.user_id == current_user.id).order_by(desc(models.Post.created_at)).all()
    if not posts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No posts found for this user"
        )

    return posts

@app.get("/getAllUsers", response_model=list[getAllUsers])
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):
    users = db.query(models.User).filter(models.User.id != current_user.id).all()
    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users found"
        )

    return users

@app.post("/addFriends")
def add_friends(friend:Friend_Requests ,db: Session = Depends(get_db), current_user:models.User = Depends(oauth.get_current_user)):

    try:

        receiver  = db.query(models.User).filter(models.User.name == friend.receiver_name).first()
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        existing_request = db.query(models.Friend).filter(
            or_(
                (models.Friend.sender_id == current_user.id) & (models.Friend.receiver_id == receiver.id),
                (models.Friend.sender_id == receiver.id) & (models.Friend.receiver_id == current_user.id)
            )
        ).first()

        if existing_request:
            if getattr(existing_request, "status") == "pending":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Friend request already sent"
                )

            elif getattr(existing_request, "status") == "accepted":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You are already friends with this user"
                )

            elif getattr(existing_request, "status") == "rejected":
                setattr(existing_request, "status", "pending")
                existing_request.sender_id = current_user.id
                existing_request.receiver_id = receiver.id
                db.commit()
                db.refresh(existing_request)
                return {"message": "Friend request sent again", "request_id": existing_request.id}

        friend_request = models.Friend(
            sender_id=current_user.id,
            receiver_id=receiver.id,
            status=models.FriendStatus.PENDING
        )

        db.add(friend_request)
        db.commit()
        db.refresh(friend_request)

        return {"message": "Friend request sent successfully", "request_id": friend_request.id}

    except Exception as e:
        if 'no_self_friend_request' in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot send a friend request to yourself."
            )

        if 'Friend request already sent' in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already sent a friend request to this user."
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred."
            )

@app.post("/respondToFriendRequest")
def respond_to_friend_request(response: Friend_Response, db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):

    sender = db.query(models.User).filter(models.User.name == response.sender_name).first()

    if not sender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sender not found"
        )

    # Find the friend request
    friend_request = db.query(models.Friend).filter(
        models.Friend.sender_id == sender.id,
        models.Friend.receiver_id == current_user.id,
        models.Friend.status == "pending"
    ).first()

    if not friend_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found or you're not authorized to respond"
        )

    # Update the status
    setattr(friend_request, 'status', response.status.value)
    db.commit()
    db.refresh(friend_request)

    status_message = "accepted" if response.status == FriendStatus.ACCEPTED else "rejected"
    return {"message": f"Friend request from {response.sender_name} {status_message} successfully"}

@app.get("/getPendingFriendRequests", response_model=list[Friend_Request_Detail])
def get_pending_friend_requests(db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):
    # Get friend requests where current user is the receiver and status is pending
    requests = db.query(
        models.Friend.id,
        models.Friend.status,
        models.User.name.label("sender_name")
    ).join(
        models.User, models.Friend.sender_id == models.User.id
    ).filter(
        models.Friend.receiver_id == current_user.id,
        models.Friend.status == models.FriendStatus.PENDING
    ).all()

    if not requests:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending friend requests found"
        )
    user = db.query(models.User).filter(models.User.id == current_user.id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Format the response
    formatted_requests = []
    for req in requests:
        formatted_requests.append({
            "id": req.id,
            "sender_name": req.sender_name,
            "receiver_name": user.name,
            "status": req.status
        })

    return formatted_requests

@app.get("/showAllFriends", response_model=list[getAllUsers])
def show_all_friends(db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):

    friend_rows = db.query(
        models.Friend.sender_id, 
        models.Friend.receiver_id
    ).filter(
        or_(
            models.Friend.sender_id == current_user.id,
            models.Friend.receiver_id == current_user.id
        ),
        models.Friend.status == models.FriendStatus.ACCEPTED
    ).all()

    if not friend_rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No friends found"
        )

    # get the user ids from the friend_rows
    friend_ids = []

    for sender_id, receiver_id in friend_rows:
        if sender_id == current_user.id:
            friend_ids.append(receiver_id)
        else:
            friend_ids.append(sender_id)

    # get the user names from the user table using the friend_ids
    friends = db.query(models.User).filter(models.User.id.in_(friend_ids)).all()
    
    return friends

@app.get("/friends/posts", response_model=list[FriendPost])
def get_friend_posts(db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):
    # Get all friends of the current user
    friends = db.query(models.Friend).filter(
        or_(
            models.Friend.sender_id == current_user.id,
            models.Friend.receiver_id == current_user.id
        ),
        models.Friend.status == models.FriendStatus.ACCEPTED
    ).all()

    # Extract friend IDs
    friend_ids = []
    for f in friends:
        sender_id_val = getattr(f, "sender_id", None)
        receiver_id_val = getattr(f, "receiver_id", None)

        if sender_id_val == current_user.id:
            friend_ids.append(receiver_id_val)
        else:
            friend_ids.append(sender_id_val)

    # Get posts by friends, join with User table
    posts_with_names = db.query(
        models.Post.title,
        models.Post.content,
        models.Post.created_at,
        models.User.name.label("friend_name")
    ).join(
        models.User, models.User.id == models.Post.user_id
    ).filter(
        models.Post.user_id.in_(friend_ids)
    ).order_by(
        desc(models.Post.created_at)
    ).all()

    return posts_with_names


@app.delete("/delete/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth.get_current_user)):
    delete_post = db.query(models.Post).filter(models.Post.id == post_id).first()

    if not delete_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if the post belongs to the current user (authorization)
    if getattr(delete_post, "user_id")  != getattr(current_user, "id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts"
        )
    
    db.delete(delete_post)
    db.commit()
    return {"message": "Post deleted successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)