# Client Check-In & Queue Management System

## Overview

This project is a web-based client check-in and queue management system designed for organizations such as food banks or service centers.

It allows clients to sign in digitally and enables staff to manage and track service flow in real time.

---

## Live Demo

* Client Interface:
  https://script.google.com/macros/s/AKfycbz2t7mnbPzlljNMv0Cc1ikGY3ZtOzxK0KasqZkZjcBFSan3OMgmsfB4I_cz-lpHssKw/exec?view=client

* Staff Dashboard:
  https://script.google.com/macros/s/AKfycbz2t7mnbPzlljNMv0Cc1ikGY3ZtOzxK0KasqZkZjcBFSan3OMgmsfB4I_cz-lpHssKw/exec?view=staff

---

## Features

### Client Side

* Simple check-in form (First Name, Last Name)
* Option to mark as New or Returning client
* Duplicate name handling ("Is this you?" confirmation)

### Staff Dashboard

* Real-time queue visibility
* First-come, first-served ordering
* Status tracking:

  * Waiting
  * In Office
  * Ready to be Served
* Differentiates new vs returning clients

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

Originally designed for a community food pantry to improve efficiency and reduce manual tracking of client queues. Works across browsers, tested primarily on Chrome.

---
