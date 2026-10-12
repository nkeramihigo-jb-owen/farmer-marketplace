# Farmer Marketplace System

### Connecting Farmers to Customers Through a Digital Marketplace

The **Farmer Marketplace System** is a front-end web application designed to connect farmers with customers through an accessible online marketplace. It allows customers to browse agricultural products, explore farmer information, add products to a shopping cart, and simulate the checkout process.

Farmers can access a dedicated portal to register, log in, and interact with the marketplace.

The project demonstrates how modern web technologies can be used to build a simple, user-friendly agricultural marketplace.



##  Table of Contents

* [Project Overview](#-project-overview)
* [Objectives](#-objectives)
* [Features](#-features)
* [User Roles](#-user-roles)
* [Technologies Used](#-technologies-used)
* [Application Workflow](#-application-workflow)
* [Getting Started](#-getting-started)
* [Project Structure](#-project-structure)
* [Data Storage](#-data-storage)
* [Future Improvements](#-future-improvements)
* [Author](#-author)



## Project Overview

The Farmer Marketplace System provides a digital platform where agricultural products can be presented to potential customers.

The application focuses on simplifying product discovery and demonstrating the essential components of an online marketplace, including product listings, farmer information, shopping cart management, and order confirmation.

It is built using HTML, CSS, and JavaScript, with browser local storage used to simulate data persistence.

**Project Type:** Front-End Web Application

**Target Users:** Farmers and customers


##  Objectives

* Provide a digital platform for showcasing agricultural products.
* Make it easier for customers to discover available farm produce.
* Allow customers to view product prices and farmer information.
* Provide a dedicated portal for farmer registration and login.
* Demonstrate an online shopping workflow, from browsing products to order confirmation.
* Apply front-end development skills to a practical agricultural use case.


##  Features

###  Customer Features

* Browse available agricultural products without creating an account.
* Search and explore product listings.
* View product details, prices, and associated farmer information.
* Add products to a shopping cart.
* Review cart items before checkout.
* Complete a simulated checkout process.
* View order confirmation after checkout.

###  Farmer Features

* Access a dedicated Farmer Portal.
* Register as a farmer.
* Log in through the farmer interface.
* Provide business and contact information.
* Access a farmer dashboard.

###  Interface and Usability

* Structured, user-friendly web pages.
* Navigation between the main marketplace pages.
* Responsive styling where implemented.
* JavaScript-powered interactions.
* Browser local storage for simulated data persistence.


##  User Roles

### 1. Customers

Customers can access the marketplace without logging in. They can browse agricultural products, review farmer information, manage their shopping cart, and proceed through the simulated checkout workflow.

### 2. Farmers

Farmers use the dedicated Farmer Portal to register or log in. The portal provides a foundation for farmer-facing marketplace functionality.


##  Technologies Used

| Technology           | Purpose                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| HTML5                | Structures the web pages and application content.                      |
| CSS3                 | Provides styling, layout, and visual presentation.                     |
| JavaScript           | Implements interactive features and marketplace logic.                 |
| Browser localStorage | Simulates persistent storage for products, farmers, carts, and orders. |
| Git and GitHub       | Support version control and project hosting.                           |


##  Application Workflow

The customer journey follows this sequence:

**Dashboard → Browse Products → Product Details → Cart → Checkout → Order Confirmation**

The farmer journey follows this sequence:

**Farmer Portal → Registration or Login → Farmer Dashboard**

These workflows demonstrate the main interactions supported by the front-end application.



##  Getting Started

Follow these steps to run the project locally.

### Prerequisites

You need:

* A modern web browser, such as Google Chrome, Microsoft Edge, or Firefox.
* Git, if you want to clone the repository.
* A code editor such as Visual Studio Code.

### Installation

**1. Clone the repository**

bash
git clone https://github.com/nkeramihigo-jb-owen/farmer-marketplace.git




**2. Open the project folder**

bash
cd farmer-marketplace


**3. Open the application**

Open the project folder in Visual Studio Code.

Run the application's starting HTML file in your browser. If the project uses multiple linked HTML pages, keep the existing folder structure and relative file paths intact.

You can also use the Live Server extension in Visual Studio Code if you have it installed.

No backend server or database setup is required for the current front-end demonstration.


##  Project Structure

The project is organized around the following components:

* **HTML files:** Define the marketplace pages and user interfaces.
* **CSS files:** Control the application's appearance and layout.
* **JavaScript files:** Handle interactions, cart operations, farmer portal functionality, and simulated order processing.
* **Image assets:** Provide product images and other visual resources.

Refer to the actual repository files for the complete directory structure.


##  Data Storage

The current application uses browser `localStorage` to simulate data persistence.

The application uses the following storage keys:

| Storage Key               | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `harvestHubProducts`      | Stores marketplace product data.                                  |
| `harvestHubCart`          | Stores shopping cart information.                                 |
| `harvestHubFarmers`       | Stores farmer registration data.                                  |
| `harvestHubOrders`        | Stores simulated customer orders.                                 |
| `harvestHubCurrentFarmer` | Tracks the current farmer session in the front-end demonstration. |

**Important:** Browser local storage is suitable for demonstrating front-end functionality, but it is not a secure substitute for a production database or server-side authentication.

Data stored in a browser is local to that browser and origin. It does not automatically synchronize across different users or devices.


## Future Improvements

Potential future enhancements include:

* Integrating a backend using Django, Flask, or another web framework.
* Connecting the application to a relational database.
* Implementing secure, server-side farmer authentication.
* Supporting complete farmer product management.
* Adding real-time product availability and stock management.
* Integrating secure online payment services.
* Adding order tracking and management.
* Improving accessibility and responsive design.
* Deploying the application for public access.


## Author

**NKERA JB OWEN**

GitHub: [@nkeramihigo-jb-owen](https://github.com/nkeramihigo-jb-owen)


##  License

This project was developed for educational and demonstration purposes. A formal open-source license can be added if the project is intended for public reuse.


*Building digital solutions that connect farmers and customers.*
