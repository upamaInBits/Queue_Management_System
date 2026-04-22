# Client Check-In & Queue Management System

## Overview

This project is a web-based client check-in and queue management system designed for organizations such as food banks or service centers.

It allows clients to sign in digitally and enables staff to manage and track service flow in real time.

---

## Live Demo

* Client Interface:
  https://script.google.com/macros/s/AKfycbyb78lZVRkQ8HAo4AsfU5YhIbU9dD4SJ9KZrteJjePL72yE5IE5htUgvXggoGSp8yx5/exec?view=client

* Staff Dashboard:
 https://script.google.com/macros/s/AKfycbyb78lZVRkQ8HAo4AsfU5YhIbU9dD4SJ9KZrteJjePL72yE5IE5htUgvXggoGSp8yx5/exec?view=staff

Works across browsers, tested primarily on Chrome. If access issues appear in a regular browser session, opening the app in an incognito window or a browser signed into the correct Google account resolves the issue.

---

## Features

### Client Side

* Simple check-in form (First Name, Last Name)
* Option to mark as New or Returning client
* Duplicate name handling ("Is this you?" confirmation)
<img width="1086" height="698" alt="image" src="https://github.com/user-attachments/assets/434496d4-98f0-4a05-b9ac-f6d68014d504" />



### Staff Dashboard

* Real-time queue visibility
* First-come, first-served ordering
* Status tracking:

  * Waiting
  * In Office
  * Ready to be Served
* Differentiates new vs returning clients
<img width="1086" height="698" alt="image" src="https://github.com/user-attachments/assets/21829c3d-06f9-412e-8391-1ee6eb4a0400" />
<img width="1086" height="698" alt="image" src="https://github.com/user-attachments/assets/f3c750ba-3d46-4cda-8ef7-1dcd82e90f22" />


---

## Backend

* Google Apps Script (server-side logic)
* Google Sheets used as a database
* Automatic queue number generation
* Duplicate entry prevention

---

## Technologies Used

* HTML, CSS, JavaScript
* Google Apps Script
* Google Sheets

---

## Key Challenges Solved

* Handling duplicate client names
* Maintaining real-time queue updates
* Preventing duplicate same-day check-ins
* Designing a simple, user-friendly interface for non-technical users

---

## Use Case

Originally designed for a community food pantry to improve efficiency and reduce manual tracking of client queues. 

---
