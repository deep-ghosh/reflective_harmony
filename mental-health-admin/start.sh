#!/bin/bash

echo "Starting Mental Health Admin Dashboard..."
echo "=========================================="

# Start backend server
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend dev server
echo "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "✓ Services started successfully!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
