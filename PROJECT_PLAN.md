# Voice Virtual Assistant Project Plan

## 1. Main Goals and Objectives

**Project Goal:**
Build a Voice Virtual Assistant web application that allows users to register, log in, and access features such as weather lookup, navigation, chat, and translation, with voice input/output and secure user management.

**Objectives:**
- Provide a seamless, voice-enabled assistant experience for users.
- Ensure secure authentication and user data management.
- Integrate with external APIs (Google Weather, Google Maps, Google Translate).
- Deliver a Minimally Viable Product (MVP) that meets all stakeholder needs without unnecessary complexity.
- **AI chat assistant uses OpenRouter (OpenAI/Cloud) exclusively for responses. Local LLMs (e.g., Ollama) are not used.**

**MVP Deliverable:**
A deployed web application with:
- User registration, login, and password reset
- Dashboard with Weather, Air Quality, Chance of Rain, Navigation, Chat, and Translation sections
- Voice input and output for all main features
- Data stored in MongoDB (Atlas or Compass)
- Responsive, modern UI
- **AI chat powered by OpenRouter (OpenAI/Cloud) only**

> **Note:** No additional features will be added beyond the above until the MVP is delivered, to avoid scope creep.

---

## 2. Stakeholders, Needs, Wants, and Expectations

| Stakeholder         | Needs (Must Have)                                                                 | Wants (Nice to Have)                                  | Expectations (Non-Functional/Technical)                |
|--------------------|-----------------------------------------------------------------------------------|------------------------------------------------------|--------------------------------------------------------|
| End Users          | - Register, log in, reset password<br>- Use voice for all features<br>- See weather, navigate, chat, translate, air quality, chance of rain | - Fast, modern UI<br>- Mobile-friendly<br>- Hear translations | - Secure data<br>- Fast response<br>- No downtime      |
| Project Team       | - Clear requirements<br>- Defined roles<br>- Task tracking                        | - Easy deployment<br>- Good documentation            | - Code quality<br>- Version control<br>- Test coverage |
| Instructor/Client  | - MVP delivered on time<br>- Meets specification                                  | - Clean codebase<br>- Demo-ready                     | - Hosted, accessible app<br>- No scope creep           |

**Functional Requirements:**
- User authentication (register, login, reset password)
- Dashboard with Weather, Navigation, Chat, Translation
- Voice input/output
- Data persistence (MongoDB)

**Non-Functional Requirements:**
- Security (JWT, password hashing)
- Usability (responsive UI, accessibility)
- Performance (fast API responses)
- Reliability (error handling, uptime)

**Technical Requirements:**
- Node.js/Express backend
- React frontend
- MongoDB database
- Integration with Google APIs
- Deployment (local or cloud)

---

## 3. Task List, Resources, and Assignments

| Task                                      | Lead            | Team Members         | Estimated Resources/Time |
|-------------------------------------------|-----------------|----------------------|-------------------------|
| Requirements Gathering & Planning         | Diana Torres    | Sachin, Moses        | 2 days                  |
| UI/UX Design (Wireframes, Prototypes)     | Moses S Varghese| Diana, Sachin        | 3 days                  |
| Backend Setup (Node.js, Express, MongoDB) | Sachin Kumar    | Diana, Moses         | 3 days                  |
| Authentication System                     | Sachin Kumar    | Diana                | 2 days                  |
| Dashboard & Routing                       | Diana Torres    | Moses                | 2 days                  |
| Weather Integration                       | Moses S Varghese| Sachin               | 1 day                   |
| Navigation Integration                    | Moses S Varghese| Diana                | 1 day                   |
| Chat/Conversation Feature                 | Diana Torres    | Sachin               | 2 days                  |
| Translation Integration                   | Sachin Kumar    | Moses                | 2 days                  |
| Voice Input/Output                        | Moses S Varghese| Diana                | 2 days                  |
| Database Integration                      | Sachin Kumar    | Moses                | 1 day                   |
| Testing & QA                              | Diana Torres    | Sachin, Moses        | 2 days                  |
| Deployment & Documentation                | Moses S Varghese| Diana, Sachin        | 2 days                  |

---

## 4. Resources Required

- **Development Tools:**
  - Node.js, npm, React, Express, MongoDB Atlas/Compass, VS Code, GitHub
- **APIs:**
  - Google Maps, Google Weather (via search), Google Translate API
- **Hosting:**
  - Local development (Ollama or local Node.js)
  - Optionally deploy to cloud (e.g., Vercel, Heroku, or AWS for production)
- **Data Storage:**
  - MongoDB Atlas (cloud) or MongoDB Compass (local)
- **Other:**
  - Email service for password reset (Gmail SMTP)
  - Google Cloud account for Translate API key

---

## 5. Schedule & Milestones (GANTT-style Table)

| Week | Milestone/Task                        | Lead            | Team Members         | Status      |
|------|---------------------------------------|-----------------|----------------------|-------------|
| 1    | Requirements & Planning               | Diana           | Sachin, Moses        | In Progress |
| 1    | UI/UX Design                          | Moses           | Diana, Sachin        | Pending     |
| 2    | Backend Setup                         | Sachin          | Diana, Moses         | Pending     |
| 2    | Authentication                        | Sachin          | Diana                | Pending     |
| 2    | Dashboard & Routing                   | Diana           | Moses                | Pending     |
| 3    | Weather & Navigation Integration      | Moses           | Sachin, Diana        | Pending     |
| 3    | Chat & Translation Features           | Diana, Sachin   | Moses                | Pending     |
| 4    | Voice Input/Output                    | Moses           | Diana                | Pending     |
| 4    | Database Integration                  | Sachin          | Moses                | Pending     |
| 4    | Testing & QA                          | Diana           | Sachin, Moses        | Pending     |
| 5    | Deployment & Documentation            | Moses           | Diana, Sachin        | Pending     |

**Roles & Responsibilities:**
- **Diana Torres:** Project management, dashboard, chat, QA
- **Sachin Kumar:** Backend, authentication, translation, database
- **Moses S Varghese:** UI/UX, weather, navigation, voice, deployment

---

## 6. Team Members
- **Sachin Kumar**
- **Diana Torres**
- **Moses S Varghese** 