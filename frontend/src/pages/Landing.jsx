import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "../brand.js";
import { IconBoard, IconChat, IconVideo, IconBot, IconTimer, IconKey } from "../icons.jsx";

const FEATURES = [
  { Icon: IconBoard, title: "A shared whiteboard", text: "Sketch a problem out and watch everyone's strokes land instantly, no export or screenshare needed." },
  { Icon: IconChat, title: "One conversation per room", text: "Chat stays with the room and saves itself, so context is still there when someone joins late." },
  { Icon: IconVideo, title: "A call, already open", text: "Every room has a video call built in from the start -- nobody has to send a separate link." },
  { Icon: IconBot, title: "A study bot on call", text: "Ask a question mid-session and the answer shows up in the chat for the whole room to see." },
  { Icon: IconTimer, title: "One timer, everyone together", text: "Start a focus block and the whole room counts down on the same clock." },
  { Icon: IconKey, title: "In with a code", text: "No invite flow to configure -- share six characters and you're in the same room." },
];

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <header className="landing-nav">
          <span className="brand">{APP_NAME}</span>
          <div className="landing-nav-links">
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/signup"><button className="brass">Sign up free</button></Link>
          </div>
        </header>

        <section className="hero">
          <h1>{APP_TAGLINE}</h1>
          <p>
            Create a room and it comes with a whiteboard, a chat, a video call, an AI study bot,
            and a synced timer -- share the room code and everyone's in the same session.
          </p>
          <div className="hero-actions">
            <Link to="/signup"><button className="brass large">Create your first room</button></Link>
            <Link to="/login" className="large-link">I already have an account</Link>
          </div>
        </section>
      </div>

      <section className="features">
        {FEATURES.map(({ Icon, title, text }) => (
          <div className="feature-row" key={title}>
            <div className="icon-wrap"><Icon /></div>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        <span className="brand">{APP_NAME}</span>
        <p>Built as a portfolio project.</p>
        <div className="landing-footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
