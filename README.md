::: {align="center"}
# 🎬 CineBook
Live Link: https://cine-book-lime.vercel.app/
### Online Movie Ticket Booking System

A full-stack movie ticket booking application built with **React,
TypeScript, Spring Boot, and MySQL**.

[Features](#-features) · [Architecture](#-architecture) · [Tech
Stack](#-technology-stack) · [Database](#-database-design) ·
[Setup](#-getting-started) · [API](#-api-overview)
:::

------------------------------------------------------------------------

## 📌 Overview

**CineBook** is a web-based movie ticket booking application that brings
the essential stages of movie discovery and ticket booking into one
platform. Users can explore movies, view theatres and show schedules,
select seats, complete a simulated payment flow, and manage their
bookings.

The project uses a React and TypeScript frontend connected to a Java
Spring Boot REST API. MySQL stores the application's relational data,
while Spring Data JPA and Hibernate handle object-relational mapping and
persistence.

> **Project note:** The payment flow is simulated for demonstration
> purposes. The application does not currently process real payments
> through an external payment gateway.

## ✨ Features

-   **Movie discovery** --- browse available movies and view movie
    information.
-   **Theatre and show listings** --- explore theatres and scheduled
    showtimes.
-   **Seat selection** --- view show-specific seats and their
    reservation state.
-   **Booking workflow** --- submit a booking after the simulated
    payment-success flow.
-   **Booking history** --- retrieve bookings associated with a customer
    profile.
-   **Booking details** --- view information about an individual
    booking.
-   **Cancellation** --- request cancellation through the supported
    booking workflow.
-   **Seat availability validation** --- backend validation helps
    prevent booking seats that are already reserved.
-   **REST-based integration** --- frontend and backend communicate
    through HTTP APIs using JSON.

## 🧱 Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React, TypeScript       User interface and
                                                  application
                                                  interactions

  Build tooling           Vite                    Frontend development
                                                  and production build

  Styling                 Tailwind CSS            Responsive UI styling

  Routing                 React Router            Client-side navigation

  HTTP client             Axios                   API communication

  Backend                 Java, Spring Boot       REST API and business
                                                  logic

  Persistence             Spring Data JPA         Repository-based
                                                  database access

  ORM                     Hibernate               Java
                                                  object-to-relational
                                                  mapping

  Database                MySQL                   Persistent relational
                                                  data

  Version control         Git, GitHub             Source-code management
  -----------------------------------------------------------------------

## 🏛️ Architecture

CineBook follows a layered client--server architecture:

``` text
┌──────────────────────────────┐
│       React Frontend         │
│   TypeScript · Vite · UI     │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│       Spring Boot API        │
│       REST Controllers       │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│        Service Layer         │
│     Booking & App Logic      │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│     Spring Data JPA /        │
│        Hibernate ORM         │
└──────────────┬───────────────┘
               │ SQL
               ▼
┌──────────────────────────────┐
│          MySQL               │
│     Relational Database      │
└──────────────────────────────┘
```

### Request lifecycle

1.  A user performs an action in the React frontend.
2.  The frontend sends an HTTP request to a Spring Boot REST endpoint.
3.  The controller delegates the request to the relevant service.
4.  The service applies application rules and uses repositories to
    access data.
5.  Hibernate and JPA translate persistence operations into database
    interactions.
6.  The backend returns a JSON response to the frontend.

## 🗃️ Database Design

The application uses a MySQL database named `CineBook` with seven
principal tables.

  -----------------------------------------------------------------------
  Table                               Responsibility
  ----------------------------------- -----------------------------------
  `movies`                            Movie catalogue information such as
                                      title, language, genre, duration,
                                      certificate, description, poster
                                      and trailer URLs, and active
                                      status.

  `theatre`                           Theatre name and location details.

  `shows`                             Scheduled screenings, movie and
                                      theatre references, timings, ticket
                                      price, seat counts, active status,
                                      and version field.

  `show_seats`                        Seat labels and reservation state
                                      for a particular show.

  `customers`                         Customer name, email, and phone
                                      information.

  `bookings`                          Booking records, show/customer
                                      references, customer contact
                                      fields, amount, booking timestamp,
                                      and status.

  `booking_seats`                     Seat labels associated with a
                                      booking.
  -----------------------------------------------------------------------

### Entity relationships

The principal relationships represented by the database are:

-   `movies` **1 --- N** `shows`
-   `theatre` **1 --- N** `shows`
-   `shows` **1 --- N** `show_seats`
-   `customers` **1 --- N** `bookings`
-   `shows` **1 --- N** `bookings`
-   `bookings` **1 --- N** `booking_seats`

`booking_seats` is mapped in the Java persistence model as a JPA
element-collection table for the booking's seat-label collection, rather
than as a separate domain entity.

> The exact SQL data types, key constraints, indexes, and referential
> actions should be checked against the database DDL. The table overview
> above describes the identified application schema, not a substitute
> for the live DDL.

## 🎟️ Booking Workflow

At a high level, the booking flow is:

1.  The user selects a movie, theatre, and show.
2.  The application loads the seats associated with the selected show.
3.  The user selects seat labels.
4.  The backend validates the requested seats against the current
    reservation state.
5.  The simulated payment flow determines whether the booking-success
    path proceeds.
6.  On the mock success path, the backend creates the booking and stores
    its associated seat labels.
7.  The user can view the booking in the booking-history/details flow.

A simulated payment failure is intended not to create a booking or
reserve the selected seats.

### Transaction and concurrency considerations

The `Show` entity includes a JPA `@Version` field for optimistic version
checking. The booking implementation also uses a repository method named
`findForUpdate` for seat records. Check the repository's lock annotation
or query definition for the precise locking mode used by the current
source.

## 📂 Repository Structure

The repository contains the backend project and the frontend application
in a `frontend/` directory.

``` text
CineBook/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── src/                      # Spring Boot backend source
│   └── main/
│       ├── java/
│       └── resources/
├── pom.xml                   # Maven backend configuration
├── mvnw                      # Maven wrapper (Unix)
├── mvnw.cmd                  # Maven wrapper (Windows)
└── README.md
```

*The exact package and source-file layout may evolve as the project
changes.*

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

-   Java version compatible with the backend's `pom.xml`
-   Maven, or use the included Maven Wrapper
-   Node.js and npm
-   MySQL Server
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/nikhilsharma-max/CineBook.git
cd CineBook
```

### 2. Configure the MySQL database

Create the database:

``` sql
CREATE DATABASE CineBook;
```

Configure the backend database connection in the application's
configuration (for example, `src/main/resources/application.properties`
or environment variables, depending on the current configuration).

Do not commit database passwords or other secrets to version control.

Example configuration shape:

``` properties
spring.datasource.url=jdbc:mysql://localhost:3306/CineBook
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
```

Use the actual configuration keys and Hibernate schema-generation
settings present in the project. If the application relies on SQL
scripts or migrations, run those as part of database setup.

### 3. Run the backend

From the repository root:

``` bash
./mvnw spring-boot:run
```

On Windows:

``` powershell
mvnw.cmd spring-boot:run
```

Alternatively, build the application:

``` bash
./mvnw clean package
```

Then run the generated JAR from the `target/` directory. The exact JAR
filename depends on the Maven project version.

### 4. Configure and run the frontend

Open a second terminal:

``` bash
cd frontend
npm install
```

Configure the frontend API base URL using the environment variable
expected by the Axios/API configuration in the current source. For Vite
projects, client-exposed environment variables commonly use the `VITE_`
prefix.

Example only:

``` env
VITE_API_URL=http://localhost:8080
```

Confirm the exact variable name and expected URL format in the frontend
source before creating `.env`.

Start the development server:

``` bash
npm run dev
```

Open the local URL printed by Vite in the terminal.

## 🔌 API Overview

The backend exposes REST endpoints under the `/api/v1` namespace. The
following routes are based on the identified controller paths; verify
request bodies, response fields, authentication requirements, and HTTP
methods against the current controller code.

  -----------------------------------------------------------------------------------------
  Method                  Endpoint                                  Purpose
  ----------------------- ----------------------------------------- -----------------------
  `POST`                  `/api/v1/bookings/shows/{showId}`         Submit a booking
                                                                    request for a show.

  `POST`                  `/api/v1/bookings/{bookingId}/cancel`     Request cancellation of
                                                                    a booking.

  `GET`                   `/api/v1/bookings/{bookingId}`            Retrieve an individual
                                                                    booking.

  `GET`                   `/api/v1/profiles/{profileId}/bookings`   Retrieve booking
                                                                    history for a profile.
  -----------------------------------------------------------------------------------------

Other catalogue, theatre, show, customer, and seat endpoints are
available according to the implemented controllers. Consult the backend
source for the complete and current API contract.

## 🧪 Testing Checklist

Use this checklist when validating the application:

-   [ ] Movie catalogue loads successfully.
-   [ ] Theatre and show information is displayed correctly.
-   [ ] Seat availability is loaded for the selected show.
-   [ ] An available seat can be booked through the mock-success flow.
-   [ ] An already reserved seat is rejected by backend validation.
-   [ ] Mock payment failure does not create a booking or reserve seats.
-   [ ] Booking history returns the expected customer/profile bookings.
-   [ ] Booking details can be retrieved.
-   [ ] Cancellation follows the implemented booking rules.
-   [ ] Database records reflect the expected application operations.

## ☁️ Deployment

The project has been configured for a split deployment architecture:

-   **Frontend:** Vercel
-   **Backend:** Railway
-   **Database:** MySQL hosted with the backend deployment environment

For deployment, configure environment variables in the hosting platforms
rather than hardcoding credentials. Ensure that:

-   The frontend API base URL points to the deployed backend.
-   The backend CORS configuration permits the deployed frontend origin.
-   The backend database URL and credentials match the provisioned MySQL
    instance.
-   Secrets are stored in platform environment settings.
-   The deployed backend and frontend are tested together after every
    release.

## 🔐 Security and Configuration Notes

-   Never commit `.env` files, database passwords, API keys, or private
    credentials.
-   Use environment variables for deployment-specific configuration.
-   Restrict CORS to the frontend origins that should access the API.
-   Validate all user-supplied identifiers and booking inputs on the
    backend.
-   Do not treat the simulated payment flow as proof of a real payment.
-   Review authentication and authorization rules before using the
    application with real customer data.

## 🛠️ Possible Future Enhancements

-   Integration with a real payment gateway and verified payment
    callbacks.
-   Administrative tools for managing movies, theatres, and show
    schedules.
-   More comprehensive automated tests for booking and concurrency
    scenarios.
-   Booking notifications and downloadable ticket confirmations.
-   Improved search, filtering, and movie recommendations.
-   Production monitoring, audit logging, backups, and security
    hardening.

## 📄 License

No license has been specified for this repository. Unless a license is
added, the source code should be treated as **all rights reserved** by
its respective owner(s).

------------------------------------------------------------------------

::: {align="center"}
**CineBook**\
*Discover movies. Choose your seats. Book your experience.*
:::
