import { Link } from "react-router-dom"
import './Footer.css'

export default function Footer() {
  return (
    <>
      <div className="footer">
        <p>© Sandbook Social Media App. All rights reserved.</p>
        <Link to="/feedback">Give Feedback .. 💬</Link>
      </div>

    </>
  )
}
