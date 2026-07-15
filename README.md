# Taskulo

Taskulo is a modern task and project management platform designed to help individuals and teams organize their work efficiently. It provides a clean and responsive interface for managing projects, tracking tasks, and staying updated with real-time notifications.

---

## Badges





\

---

## Screenshots

### 📊 Dashboard

---

## 🎨 Frontend Template

The user interface (UI) of **Taskulo** is based on a frontend template that I designed and developed separately using **HTML, CSS, and JavaScript**.

📂 **Template Repository:**
https://github.com/alicombot/ToDo-List

---

## Tech Stack

### **Backend**

* Python
* Django

### **Database**

* SQLite / PostgreSQL

### **Frontend**

* HTML
* CSS
* JavaScript

---

## Features

* 🔐 User registration and authentication system
* 📧 Email verification for secure account activation
* 👤 User account management and profile handling
* 🏠 Landing page for product introduction
* 📊 Personalized dashboard for projects & tasks
* 📁 Project organization and management system
* 📝 Create, edit, and delete tasks
* 📈 Track task progress and status updates
* 🔔 Notifications for task status changes
* 🎨 Modern and responsive user interface

---

## Planned Features

* 🔌 Dedicated REST API for external integrations
* 🤖 Telegram Bot integration via API
* 📝 Create and manage tasks directly from Telegram
* 🔔 Telegram notifications for project and task updates
* 🧠 AI-powered task management assistant
* 💬 Create tasks using natural language conversations
* 📊 Intelligent task analysis and categorization

---

## Installation

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/alicombot/taskulo.git
cd taskulo
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Apply migrations

```bash
python manage.py migrate
```

### 6. Create a superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run the development server

```bash
python manage.py runserver
```

Open your browser and visit:

```text
http://127.0.0.1:8000/
```

---

## Usage

* Create a new account and verify your email
* Log in to access your dashboard
* Create a new project
* Add and manage tasks within projects
* Track task progress and status
* Receive notifications for task updates

---

## Environment Variables

This project uses environment variables to manage sensitive settings.

Create a `.env` file and configure your Django settings accordingly (such as `SECRET_KEY`, `DEBUG`, and database credentials).

---

## Roadmap

* 🔌 REST API for external integrations
* 🤖 Telegram Bot integration
* 🧠 AI-powered task management assistant
* 👥 Team collaboration features
* 📊 Advanced analytics and reporting

---

## Authors

* [@amirreza4602](https://github.com/amirreza4602)
* [@alicombot](https://github.com/alicombot)

---

## License

This project is licensed under the **MIT License**.
