# Employee Management System (EMS)

A comprehensive, full-stack solution designed to streamline workforce management, built with a powerful .NET Core API and a responsive Angular 14 user interface. This system provides a robust suite of tools for administrators and a seamless dashboard experience for employees.

![Admin Dashboard](./Screenshots/Employee%20Management%20System%20-%20Google%20Chrome%2006_22_2025%2011_39_54%20AM.png)

---

## ✨ Key Features

This platform is divided into two main dashboards, each tailored to its user role:

### 👑 Admin Dashboard
A powerful control center for managing the entire organization.
*   **📈 Real-time Analytics:** Get an instant overview of total employees, departments, leave requests, and leave types.
*   **🏢 Department Management:** Create, view, and manage all company departments.
*   **👥 Employee Management:** Onboard new employees, view employee lists, and manage their details.
*   **💰 Salary & Payroll:** Handle salary assignments and payroll processing.
*   **🌴 Leave Management:** Approve or reject leave requests submitted by employees.
*   **✅ Attendance Tracking:** Monitor and mark daily employee attendance.
*   **📊 Reports & Insights:** Generate reports on various aspects of workforce data.
*   **📢 Announcements:** Broadcast messages to all employees.
*   **✅ Onboarding Checklist:** A step-by-step guide to ensure all initial setup tasks are completed.

### 👤 Employee Dashboard
A personalized hub for every employee to manage their information and activities.
*   **🏠 Personalized Hub:** A welcome dashboard with quick access to common tasks.
*   **📝 Profile Summary:** View and manage personal details.
*   **✈️ Leave Overview:** Check leave balances and view past requests.
*   **🗓️ Attendance Overview:** Track personal attendance records.
*   **📋 Tasks & Responsibilities:** View assigned tasks and responsibilities.
*   **📣 Announcements & Messages:** Stay updated with company-wide announcements and direct messages.
*   **🚀 Performance Snapshot:** Review personal performance metrics.
*   **⚙️ Settings:** Manage personal account settings.

---

## 🛠️ Tech Stack

*   **Backend:** C#, ASP.NET Core 6, REST API, SignalR (for real-time notifications)
*   **Database:** Microsoft SQL Server, Entity Framework Core
*   **Frontend:** Angular 14, TypeScript, Bootstrap 5, HTML5, CSS3
*   **IDE & Tools:** Visual Studio, VS Code, SQL Server Management Studio

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [.NET 6 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
*   [Node.js and npm](https://nodejs.org/en/)
*   [Angular CLI](https://angular.io/cli)
*   [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/Erick1472/Employee-Management-System.git
    ```
2.  **Backend Setup**
    *   Open `EmployeeManagement API.sln` in Visual Studio.
    *   In `appsettings.json`, update the `ConnectionString` to point to your SQL Server instance.
    *   In the Package Manager Console, run `Update-Database` to apply migrations.
    *   Run the API project.
3.  **Frontend Setup**
    *   Navigate to the `EmployeeManagement UI` directory.
    *   Install NPM packages:
        ```sh
        npm install
        ```
    *   Run the Angular application:
        ```sh
        ng serve
        ```
    *   Open your browser and navigate to `http://localhost:4200/`.

---

## 🖼️ Screenshots

| Login Page | Landing Page |
| :---: | :---: |
| ![Login](./Screenshots/Employee%20Management%20System%20-%20Google%20Chrome%2006_22_2025%2011_39_33%20AM.png) | ![Landing](./Screenshots/Employee%20Management%20System%20-%20Google%20Chrome%2006_22_2025%2011_40_51%20AM.png) |

| Employee Dashboard | Attendance Management |
| :---: | :---: |
| ![Employee Dashboard](./Screenshots/Employee%20Management%20System%20-%20Google%20Chrome%2006_22_2025%2011_40_13%20AM.png) | ![Attendance](./Screenshots/Employee%20Management%20System%20-%20Google%20Chrome%2006_22_2025%2011_40_41%20AM.png) |

---

## 💬 Feedback & Contact

This project is a continuous work in progress for learning and demonstration purposes. I am actively planning to add more features, including enhanced security and performance optimizations.

If you have any suggestions, feedback, or would like to connect, please feel free to reach out to me at **erickwanjau2021@gmail.com**.