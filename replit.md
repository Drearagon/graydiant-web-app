# Graydient Prompt Generator

## Overview

The Graydient Prompt Generator is a web-based AI image generation tool that allows users to create images from text descriptions. It features a modern, dark-themed interface with a clean user experience for generating AI-powered images through a simple text prompt input.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

This is a frontend-only web application built with vanilla HTML, CSS, and JavaScript. The architecture follows a simple client-side pattern with no backend components in the repository. The application is designed to communicate with an external AI image generation API endpoint.

### Frontend Architecture
- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript
- **Design Pattern**: Single-page application (SPA) with DOM manipulation
- **Styling**: CSS with CSS Grid/Flexbox for responsive layout
- **No Framework Dependencies**: Built without any JavaScript frameworks for simplicity

## Key Components

### 1. User Interface (index.html)
- **Header Section**: Branding with gradient text effects
- **Input Section**: Textarea for prompt input with character counter (500 char limit)
- **Generate Button**: Action trigger with loading spinner
- **Result Section**: Image display area with placeholder state
- **Error Handling**: Error message display component

### 2. Styling (style.css)
- **Design System**: Dark theme with gradient accents
- **Responsive Design**: Mobile-first approach with flexible layouts
- **Visual Features**: 
  - Gradient backgrounds and text effects
  - Modern card-based layout
  - Smooth transitions and hover states
  - Loading spinner animations

### 3. Application Logic (script.js)
- **Event Management**: Input validation, button interactions, keyboard shortcuts
- **State Management**: Loading states, error handling, character counting
- **API Integration**: HTTP requests to external image generation service
- **User Experience**: Real-time feedback, input validation, error recovery

## Data Flow

1. **User Input**: User enters text prompt in textarea
2. **Validation**: Client-side validation (character limits, required fields)
3. **API Request**: POST request to external VPS endpoint (`https://your-vps-url/render`)
4. **Response Handling**: Display generated image or show error messages
5. **State Updates**: Update UI based on request status (loading, success, error)

## External Dependencies

### Third-Party Services
- **Feather Icons**: Icon library from CDN for UI elements
- **External AI API**: Image generation service hosted on separate VPS
  - Endpoint: `https://your-vps-url/render`
  - Expected to handle POST requests with prompt data

### Browser APIs
- **DOM API**: For element manipulation and event handling
- **Fetch API**: For HTTP requests to image generation service

## Deployment Strategy

### Current Setup
- **Static Hosting**: Can be deployed to any static web hosting service
- **No Build Process**: Direct deployment of source files
- **CDN Dependencies**: Relies on external CDN for icons

### Deployment Options
- **GitHub Pages**: Direct deployment from repository
- **Netlify/Vercel**: Simple static site deployment
- **Traditional Web Hosting**: Upload files to any web server

### Configuration Requirements
- **API Endpoint**: Update `API_ENDPOINT` constant in script.js
- **CORS**: External API must allow cross-origin requests from domain
- **HTTPS**: Recommended for production deployment

### Limitations
- **API Dependency**: Application requires external image generation service
- **No Offline Capability**: Requires internet connection for functionality
- **Client-Side Only**: No server-side processing or data persistence