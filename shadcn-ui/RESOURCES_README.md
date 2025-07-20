# Resources Module - EduLearn Platform

## Overview

The Resources module provides a comprehensive learning resource management system for the EduLearn platform. It allows users to discover, submit, and manage educational resources across various subjects and difficulty levels.

## Features

### 🎯 Core Features

- **Resource Discovery**: Browse and search through curated educational resources
- **Advanced Filtering**: Filter by type, level, subject, and tags
- **Resource Submission**: Submit new educational resources to the community
- **Resource Details**: Detailed view with related web search results
- **User Management**: Edit and delete resources (for owners and admins)
- **Web Search Integration**: Find related resources from the web

### 📚 Resource Types

- **Course**: Comprehensive learning courses
- **Tutorial**: Step-by-step guides
- **Video**: Video-based learning content
- **Article**: Written educational content
- **Tool**: Educational tools and utilities
- **Document**: Reference materials and documentation

### 🎓 Difficulty Levels

- **Beginner**: Suitable for newcomers to the subject
- **Intermediate**: For those with some experience
- **Advanced**: For experienced learners

### 📖 Subjects

- **Programming**: Software development and coding
- **Design**: UI/UX and graphic design
- **Business**: Business strategy and management
- **Data Science**: Data analysis and machine learning
- **Marketing**: Digital and traditional marketing

## Database Schema

### Resources Table

```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('beginner', 'intermediate', 'advanced')),
  course TEXT NOT NULL,
  tags TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('video', 'article', 'tutorial', 'course', 'tool')),
  duration TEXT,
  author TEXT NOT NULL,
  rating REAL DEFAULT 0,
  thumbnail TEXT,
  link TEXT NOT NULL,
  submitter_email TEXT,
  submitter_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### GET /api/resources
Fetch resources with optional filtering

**Query Parameters:**
- `type`: Filter by resource type
- `level`: Filter by difficulty level
- `course`: Filter by subject
- `search`: Search in title, description, and tags

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 8
}
```

### POST /api/resources
Add a new resource

**Body:**
```json
{
  "title": "Resource Title",
  "description": "Resource description",
  "level": "beginner",
  "course": "programming",
  "tags": ["react", "javascript"],
  "type": "course",
  "duration": "8 hours",
  "author": "Author Name",
  "link": "https://example.com"
}
```

### GET /api/resources/[id]
Get a specific resource by ID

### PUT /api/resources/[id]
Update a resource (owners and admins only)

### DELETE /api/resources/[id]
Delete a resource (owners and admins only)

### POST /api/resources/submit
Submit a new resource for review

**Body:**
```json
{
  "title": "Resource Title",
  "description": "Resource description",
  "level": "beginner",
  "course": "programming",
  "tags": ["react", "javascript"],
  "type": "course",
  "duration": "8 hours",
  "author": "Author Name",
  "link": "https://example.com",
  "submitterEmail": "user@example.com",
  "submitterName": "User Name",
  "submitterNotes": "Additional notes"
}
```

### POST /api/resources/web-search
Search for related resources on the web

**Body:**
```json
{
  "query": "react fundamentals"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "title": "React Fundamentals",
      "link": "https://react.dev/learn",
      "snippet": "Learn React fundamentals..."
    }
  ],
  "query": "react fundamentals",
  "source": "DuckDuckGo + Curated"
}
```

## Components

### Resources.tsx
Main resources listing page with:
- Search functionality
- Advanced filtering
- Resource grid display
- Submit resource dialog

### ResourceDetail.tsx
Detailed resource view with:
- Resource information
- Related web search results
- Edit/delete functionality (for owners/admins)
- Quick actions

## Setup Instructions

### 1. Initialize Database

```bash
npm run init-db
```

This will:
- Create the database with all tables
- Seed with sample resources
- Set up proper indexes

### 2. Environment Variables

Create a `.env.local` file:

```env
# Database Configuration
DATABASE_PATH=edulearn.db

# JWT Secret for Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

## Usage

### For Users

1. **Browse Resources**: Visit `/resources` to see all available resources
2. **Search & Filter**: Use the search bar and filters to find specific resources
3. **View Details**: Click "View Details" to see comprehensive resource information
4. **Submit Resources**: Click "Submit Resource" to add new educational content
5. **Visit Resources**: Click "Visit Resource" to go to the actual learning material

### For Administrators

1. **Manage Resources**: Edit or delete any resource
2. **Review Submissions**: Monitor new resource submissions
3. **Database Management**: Use the API endpoints for bulk operations

## Sample Data

The database comes pre-seeded with 8 sample resources covering:

- React Fundamentals (Programming, Beginner)
- Advanced TypeScript Patterns (Programming, Advanced)
- UI/UX Design Principles (Design, Intermediate)
- Data Science with Python (Data Science, Beginner)
- Digital Marketing Strategy (Marketing, Intermediate)
- Business Analytics Tools (Business, Intermediate)
- Node.js Backend Development (Programming, Intermediate)
- Machine Learning Fundamentals (Data Science, Advanced)

## Web Search Integration

The web search feature integrates with:

1. **DuckDuckGo Instant Answer API**: For real-time search results
2. **Curated Educational Resources**: Fallback to trusted educational platforms
3. **Multiple Sources**: Coursera, Udemy, MDN, GitHub, Stack Overflow

## Error Handling

The system includes comprehensive error handling:

- **API Validation**: All endpoints validate required fields
- **Database Errors**: Graceful handling of database connection issues
- **User Feedback**: Toast notifications for all user actions
- **Fallback Mechanisms**: Web search falls back to curated results

## Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Pagination**: Efficient resource loading
- **Caching**: API response caching where appropriate
- **Lazy Loading**: Components load data on demand

## Security Considerations

- **Input Validation**: All user inputs are validated
- **SQL Injection Protection**: Using parameterized queries
- **Access Control**: Resource editing restricted to owners and admins
- **Rate Limiting**: API endpoints include rate limiting (to be implemented)

## Future Enhancements

- [ ] Resource rating system
- [ ] User bookmarks and favorites
- [ ] Resource recommendations
- [ ] Advanced analytics
- [ ] Resource categories and subcategories
- [ ] Integration with external learning platforms
- [ ] Mobile app support
- [ ] Offline resource access
- [ ] Collaborative resource curation
- [ ] Resource versioning and history

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure the database file path is correct
   - Check file permissions
   - Run `npm run init-db` to recreate the database

2. **Resources Not Loading**
   - Check if the database is seeded
   - Verify API endpoints are working
   - Check browser console for errors

3. **Web Search Not Working**
   - The system falls back to curated results if external APIs fail
   - Check network connectivity
   - Verify API rate limits

### Debug Commands

```bash
# Reinitialize database
npm run init-db

# Check database health
curl http://localhost:3000/api/health

# Test resources API
curl http://localhost:3000/api/resources
```

## Contributing

When adding new features to the Resources module:

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Update this documentation
5. Add tests (when test framework is implemented)

## License

This module is part of the EduLearn platform and follows the same licensing terms. 