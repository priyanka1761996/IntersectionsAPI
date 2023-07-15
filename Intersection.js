const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Middleware for header-based authentication
const authenticate = (req, res, next) => {
  const authToken = req.headers.authorization;

  // Check if the auth token is valid
  if (!authToken || authToken !== 'your_auth_token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// POST /api/intersections endpoint
app.post('/api/intersections', authenticate, (req, res) => {
  // Check if the request body contains the linestring
  const { linestring } = req.body;
  if (!linestring) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Process the intersections
  const intersectingLines = findIntersectingLines(linestring);

  // Return the response
  if (intersectingLines.length === 0) {
    return res.json([]);
  } else {
    return res.json(intersectingLines);
  }
});

// Function to calculate intersections
function findIntersectingLines(linestring) {
  // Define an array of 50 lines with start and end points
  const lines = [
    { id: 'L01', start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
    { id: 'L02', start: { x: 2, y: 2 }, end: { x: 3, y: 3 } },
    // Add more lines as needed
  ];

  const intersectingLines = [];

  // Iterate through each line and check for intersections
  for (const line of lines) {
    if (doLinesIntersect(linestring, line.start, line.end)) {
      intersectingLines.push({
        lineId: line.id,
        intersectionPoint: calculateIntersectionPoint(linestring, line.start, line.end),
      });
    }
  }

  return intersectingLines;
}

// Helper function to check if two lines intersect
function doLinesIntersect(linestring, start, end) {
  for (let i = 1; i < linestring.length; i++) {
    const segmentStart = linestring[i - 1];
    const segmentEnd = linestring[i];
    if (doSegmentsIntersect(segmentStart, segmentEnd, start, end)) {
      return true;
    }
  }
  return false;
}

function doSegmentsIntersect(a, b, c, d) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const [x3, y3] = c;
  const [x4, y4] = d;

  const ua =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  const ub =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// Helper function to calculate the point of intersection between a linestring and a line
function calculateIntersectionPoint(linestring, start, end) {
  for (let i = 1; i < linestring.length; i++) {
    const segmentStart = linestring[i - 1];
    const segmentEnd = linestring[i];
    const intersectionPoint = findSegmentIntersection(segmentStart, segmentEnd, start, end);
    if (intersectionPoint) {
      return intersectionPoint;
    }
  }
  return null;
}

function findSegmentIntersection(a, b, c, d) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const [x3, y3] = c;
  const [x4, y4] = d;

  const ua =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  const ub =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    const intersectionX = x1 + ua * (x2 - x1);
    const intersectionY = y1 + ua * (y2 - y1);
    return { x: intersectionX, y: intersectionY };
  }

  return null;
}


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
