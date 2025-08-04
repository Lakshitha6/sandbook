import './css/CreatePost.css'
import { useState } from 'react'
import axiosInstance from './axiosInstance'
import { useNavigate } from 'react-router-dom'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const navigate = useNavigate()

async function handleSubmit(e) {
  e.preventDefault();
  console.log('Title:', title);
  console.log('Content:', content);

  try {
    const response = await axiosInstance.post('/createPosts', {
      title,
      content
    });

    if (response.status === 200 || response.status === 201) {
      console.log('Post created successfully:', response.data);
  
      setTitle('');
      setContent('');

      navigate('/profile')

    } else {
      console.error('Unexpected response:', response);
    }
  } catch (error) {
    console.error('Error creating post:', error);
  }

}

  return (
    <div className="create-post-wrapper">
      <form className="create-post-form" onSubmit={handleSubmit}>
        <h2>Create a New Post</h2>
        <div className="form-field">
          <label htmlFor="title">Post Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  )
}
