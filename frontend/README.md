# 🎬 CineBook — Movie Ticket Booking Platform

A full-stack movie ticket booking application inspired by BookMyShow, built using **Java, Spring Boot, React, TypeScript, and MySQL**.

CineBook provides a complete cinema-booking experience, allowing users to explore movies, discover theatres, view available shows, select seats, simulate payments, and manage their bookings through a responsive web interface.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Project Structure](#-project-structure)
6. [Database Design](#-database-design)
7. [Backend API Endpoints](#-backend-api-endpoints)
8. [Application Workflow](#-application-workflow)
9. [Getting Started](#-getting-started)
10. [Configuration](#-configuration)
11. [Running the Application](#-running-the-application)
12. [Payment Simulation](#-payment-simulation)
13. [Future Enhancements](#-future-enhancements)
14. [Important Notes](#-important-notes)

---

## 🎯 Project Overview

CineBook is a full-stack web application developed to demonstrate the implementation of a real-world movie ticket booking system.

The application connects a React-based frontend with a Spring Boot REST API and a MySQL relational database.

Users can:

- Browse movies and their details.
- Explore theatres based on selected cities.
- Check available movie shows and timings.
- Select seats from an interactive seating layout.
- Register and log in using their email address or phone number.
- Book movie tickets.
- View their booking history.
- Cancel confirmed bookings.
- Experience a simulated payment process.

The project focuses on practical implementation of full-stack development concepts, RESTful API design, relational database management, entity relationships, data persistence, and transaction-oriented application workflows.

## ✨ Features

### 1. Movie Discovery

- Browse the available movie collection.
- View movie posters, descriptions, genres, languages, and durations.
- Search movies by title.
- Explore movie details and available trailers where provided.
- Identify movies through their certification and language information.

### 2. Theatre Discovery

- Select a city from the available city dropdown.
- Browse theatres associated with the selected city.
- View theatre names and addresses.
- Explore movie shows available at each theatre.
- Filter show listings by date.

### 3. Show Management

- View movie showtimes.
- Check ticket prices.
- View available seats.
- Access seat selection from individual shows.

### 4. Customer Accounts

- Register a customer account.
- Log in using an email address or phone number.
- View account information.
- Receive success and error notifications for account operations.
- Log out of the application.

### 5. Interactive Seat Selection

- View the seating layout for a selected show.
- Select multiple available seats.
- Identify selected and unavailable seats visually.
- View selected seat labels.
- Calculate the total booking amount dynamically.
- Prevent duplicate or unavailable seat selections.

### 6. Booking Management

- Create a booking for a selected show.
- Associate the booking with a customer.
- Store the selected seat labels.
- Calculate the total booking amount.
- View booking details and booking history.
- Cancel confirmed bookings.
- Release seats when a confirmed booking is cancelled.

### 7. Simulated Payment

CineBook includes a demonstration payment interface inspired by real-world cinema booking platforms.

The payment interface provides multiple illustrative payment options and two simulation controls:

- **Mock Payment Success:** Simulates a successful transaction and proceeds with the booking flow.
- **Mock Payment Failure:** Simulates a failed transaction and allows the user to return to seat selection and try again.

This functionality is intended for academic demonstration and does not process actual payments.

### 8. User Experience

- Responsive user interface.
- Loading animations for important operations.
- Success and error notifications.
- Loading, empty, and error states.
- Interactive navigation.
- Clear booking summaries.
- Visual distinction between available, selected, and reserved seats.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Component-based UI development |
| TypeScript | Type safety and maintainable frontend code |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Styling and responsive layouts |
| Axios | HTTP communication with backend APIs |
| React Router | Client-side navigation |
| Lucide React | Icons and interface elements |

### Backend

| Technology | Purpose |
|---|---|
| Java | Backend programming language |
| Spring Boot | Application framework |
| Spring Web | REST API development |
| Spring Data JPA | Database persistence |
| Hibernate | ORM implementation |
| Maven | Dependency and build management |
| Jakarta Persistence | Entity mapping and persistence |
| MySQL Connector/J | MySQL database connectivity |

### Database

| Technology | Purpose |
|---|---|
| MySQL | Relational database |
| MySQL Workbench | Database administration and SQL queries |

---

## 🏗️ System Architecture

CineBook follows a layered full-stack architecture.

```text
              USER
               |
               v
       REACT FRONTEND
       (React + TypeScript)
               |
               | HTTP / REST API
               v
       SPRING BOOT BACKEND
               |
       +-------+--------+
       |                |
       v                v
   CONTROLLERS       SERVICES
       |                |
       +-------+--------+
               |
               v
          REPOSITORIES
               |
               v
         SPRING DATA JPA
               |
               v
           HIBERNATE
               |
               v
          MYSQL DATABASE
```

### Frontend Layer

Responsible for:

- Rendering the user interface.
- Collecting user input.
- Managing frontend state.
- Communicating with backend REST APIs.
- Displaying movie, theatre, show, seat, and booking information.

### Controller Layer

Receives HTTP requests and exposes REST endpoints.

### Service Layer

Contains the application's business logic, including:

- Movie and theatre discovery.
- Show retrieval.
- Customer registration.
- Booking creation.
- Seat availability validation.
- Booking cancellation.

### Repository Layer

Uses Spring Data JPA repositories to communicate with the database.

### Database Layer

MySQL stores persistent application information, including movies, theatres, shows, customers, seats, and bookings.

---

## 📂 Project Structure

```text
CineBookProject/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/dnm/CineBookProject/
│   │   │       │
│   │   │       ├── controller/
│   │   │       │
│   │   │       ├── service/
│   │   │       │
│   │   │       ├── repository/
│   │   │       │
│   │   │       ├── entity/
│   │   │       │
│   │   │       ├── dto/
│   │   │       │
│   │   │       ├── exception/
│   │   │       │
│   │   │       └── CineBookProjectApplication.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── CineBook_DBMS_Master_Documentation.md
│   │
│   └── test/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

*Note: The exact package and frontend subdirectory contents may vary as the application evolves.*

---

## 🗄️ Database Design

CineBook uses MySQL as its relational database management system.

The database contains the following primary tables:

| Table | Description |
|---|---|
| `movies` | Stores movie information |
| `theatre` | Stores theatre information |
| `shows` | Stores show timings, ticket prices, and availability |
| `show_seats` | Stores seat-level availability for individual shows |
| `customers` | Stores customer account information |
| `bookings` | Stores booking details and customer information |
| `booking_seats` | Stores the seat labels associated with each booking |

### Important Relationships

- A movie can have multiple shows.
- A theatre can host multiple shows.
- A show can contain multiple seats.
- A customer can make multiple bookings.
- A booking belongs to a particular customer and show.
- A booking can contain multiple seat labels.

### Database Concepts Demonstrated

- Primary keys.
- Foreign keys.
- One-to-many relationships.
- Many-to-one relationships.
- Entity mapping using JPA.
- Relational data modelling.
- Collection tables using `@ElementCollection`.
- Data consistency across related tables.
- Transaction management during booking operations.

### Seat Management

Each show maintains its own seat records.

When a customer books seats:

1. The application retrieves the requested seats.
2. It checks whether the selected seats exist and are available.
3. The selected seats are marked as reserved.
4. The available seat count is updated.
5. A booking record is created.
6. The selected seat labels are stored in `booking_seats`.

When a confirmed booking is cancelled, the corresponding seats are released and the show availability is updated.

---

## 🔌 Backend API Endpoints

The following are the core API routes used by the application.

**Base URL:**

```text
http://localhost:8080
```

### Movies

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/movies` | Retrieve active movies |

### Theatres

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/theatres?city={city}` | Retrieve theatres for a city |

### Shows

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/shows?city={city}&date={date}` | Retrieve shows for a city and date |
| GET | `/api/v1/shows/{showId}/seats` | Retrieve seats for a show |

### Customer Profiles

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/profiles` | Register a customer |
| GET | `/api/v1/profiles/login?identifier={identifier}` | Log in using email or phone |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/bookings/shows/{showId}` | Create a booking |
| GET | `/api/v1/bookings/{bookingId}` | Retrieve booking details |
| GET | `/api/v1/profiles/{profileId}/bookings` | Retrieve customer booking history |
| POST | `/api/v1/bookings/{bookingId}/cancel` | Cancel a booking |

*These routes describe the core API contract used during development. Refer to the actual backend controllers for request and response structures.*

---

## 🔄 Application Workflow

The typical booking workflow is:

```text
         START
           |
           v
     Browse Movies
           |
           v
     Select a Movie
           |
           v
     Select a City
           |
           v
     Choose a Theatre
           |
           v
      Select a Show
           |
           v
      Select Seats
           |
           v
    Review Booking
           |
           v
     Mock Payment
           |
           v
    Payment Result
       /       \
      /         \
  SUCCESS      FAILURE
     |             |
     v             v
Create Booking   Return to
     |           Seat Selection
     v
Update Seats
     |
     v
Booking Confirmation
     |
     v
   END
```

---

## 🚀 Getting Started

Follow these steps to run CineBook locally.

### Prerequisites

Install the following software:

- Java Development Kit (JDK).
- Maven (optional, since the project includes Maven Wrapper).
- Node.js and npm.
- MySQL Server.
- MySQL Workbench (recommended).
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CineBook.git
cd CineBook
```

Replace `YOUR_USERNAME` with the GitHub account that owns the repository.

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE CineBook;
```

Import or execute the required SQL seed data to populate movies, theatres, shows, and seats.

### 3. Configure the Backend

Open:

```text
src/main/resources/application.properties
```

Configure the database connection using your local MySQL credentials.

Example:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/CineBook}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

The configuration above is an example. Ensure it matches the actual application configuration and database schema.

### 4. Run the Backend

From the project root:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend will normally start at:

```text
http://localhost:8080
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Configure the Frontend

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 7. Run the Frontend

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

Open the URL in your browser to access CineBook.

---

## ⚙️ Configuration

### Backend Configuration

The backend requires:

- MySQL connection URL.
- Database username.
- Database password.
- Correct database name.
- Appropriate JPA and Hibernate settings.

### Frontend Configuration

The frontend uses the following environment variable:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Spring Boot backend |

For local development:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For deployment, update this value to the deployed backend URL.

**Security:** Never commit database passwords, API keys, or private environment files to a public GitHub repository.

---

## 💳 Payment Simulation

CineBook implements a mock payment experience for demonstration purposes.

The payment page provides a familiar payment interface with illustrative payment methods such as:

- UPI.
- Debit/Credit Card.
- Mobile Wallets.
- Gift Vouchers.
- Net Banking.
- Pay Later.

The application provides two mock transaction controls.

### Mock Payment Success

When selected:

1. A simulated transaction loading animation is displayed.
2. The payment is marked successful within the demonstration flow.
3. The booking process continues.
4. The selected seats are reflected as booked.
5. The user receives a booking confirmation.

### Mock Payment Failure

When selected:

1. A simulated payment failure is displayed.
2. The user receives an error notification.
3. The user is returned to the seat-selection flow.
4. The user can attempt the mock payment again.

**Disclaimer:** CineBook does not integrate a real payment gateway. No actual money is transferred, and no real financial transaction is performed.

---

## 🔮 Future Enhancements

Potential improvements include:

- Integration with a real payment gateway.
- Secure authentication and authorization using Spring Security.
- OTP-based customer verification.
- Admin dashboard for managing movies, theatres, and shows.
- Theatre and screen management.
- Booking confirmation emails.
- QR-code-based digital tickets.
- Movie ratings and reviews.
- Watchlist functionality.
- Coupon and discount management.
- Improved concurrency control for simultaneous seat bookings.
- Cloud deployment and production database hosting.

---

## 📚 Academic Concepts

CineBook can also be used to demonstrate important DBMS and software engineering concepts:

- ER diagram and relational schema design.
- Entity relationship mapping.
- Database normalization.
- Primary and foreign key constraints.
- Referential integrity.
- One-to-many and many-to-one relationships.
- ORM using Hibernate.
- Transaction management.
- CRUD operations.
- RESTful API architecture.
- Separation of concerns.
- Layered software architecture.

A separate DBMS documentation file is maintained in:

```text
src/main/resources/CineBook_DBMS_Master_Documentation.md
```

---

## ⚠️ Important Notes

1. CineBook is an academic and demonstration project.
2. The payment functionality is simulated and does not process real payments.
3. The application requires a running MySQL database.
4. The frontend and backend must be configured to communicate using the correct API base URL.
5. The project should use environment variables for sensitive configuration.
6. Movie posters and other external media depend on the availability of their respective image sources.
7. Production deployment requires additional security, validation, and infrastructure configuration.

---

## 👨‍💻 Author

**Nikhil Sharma**

B.Tech — Computer Science and Engineering

### Project

**CineBook — Movie Ticket Booking Platform**

Built with Java, Spring Boot, React, TypeScript, and MySQL.

---

*Made with ❤️ as a full-stack development and DBMS learning project.*
