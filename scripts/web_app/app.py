#!/usr/bin/env python3
"""
Activity Analysis Web App

This Flask application allows users to upload a CSV file with activity data and:
1. Identifies the top 5 users by total action count
2. Detects users who perform the same action more than 10 times within any 5-minute sliding window
"""

import csv
import datetime
import io
import os
from collections import defaultdict, Counter, deque
from pathlib import Path
from typing import Dict, List, Set, Tuple

from flask import Flask, render_template, request, flash, redirect, url_for, session

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for flash messages and sessions

def parse_timestamp(timestamp_str: str) -> datetime.datetime:
    """Parse an ISO format timestamp string into a datetime object."""
    return datetime.datetime.fromisoformat(timestamp_str)

def analyze_activity(csv_file) -> Tuple[List[Tuple[str, int]], Set[str]]:
    """
    Analyze user activity data from a CSV file.
    
    Args:
        csv_file: File-like object containing CSV data
        
    Returns:
        A tuple containing:
        - List of (user_id, count) tuples for top users
        - Set of user IDs who performed the same action >10 times in a 5-min window
    """
    # Count total actions per user
    user_action_counts = Counter()
    
    # Track users with repeated actions in time windows
    repeated_action_users = set()
    
    # For each user and action type, maintain a sliding window of timestamps
    user_action_windows = defaultdict(lambda: defaultdict(deque))
    
    # Five minutes in seconds
    FIVE_MINUTES = 5 * 60
    
    # Reset file pointer to beginning
    csv_file.seek(0)
    
    # Read CSV data
    reader = csv.DictReader(csv_file)
    
    # Validate CSV columns
    if not reader.fieldnames or set(reader.fieldnames) != {'timestamp', 'user_id', 'action'}:
        raise ValueError("CSV file must have columns: timestamp, user_id, action")
    
    for row in reader:
        timestamp_str = row['timestamp']
        user_id = row['user_id']
        action = row['action']
        
        # Increment total action count for this user
        user_action_counts[user_id] += 1
        
        # Parse timestamp
        try:
            timestamp = parse_timestamp(timestamp_str)
        except ValueError:
            # Skip rows with invalid timestamps
            continue
        
        # Get the window for this user and action
        window = user_action_windows[user_id][action]
        
        # Add current timestamp to the window
        window.append(timestamp)
        
        # Remove timestamps older than 5 minutes from the window
        while window and (timestamp - window[0]).total_seconds() > FIVE_MINUTES:
            window.popleft()
        
        # Check if this user has performed this action more than 10 times in the window
        if len(window) > 10 and user_id not in repeated_action_users:
            repeated_action_users.add(user_id)
    
    # Get top 5 users by action count
    top_users = user_action_counts.most_common(5)
    
    return top_users, repeated_action_users

@app.route('/', methods=['GET'])
def index():
    """Display the upload form."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    """Handle file upload and process the data."""
    # Check if a file was uploaded
    if 'csvFile' not in request.files:
        flash('No file part', 'danger')
        return redirect(url_for('index'))
    
    file = request.files['csvFile']
    
    # Check if file was selected
    if file.filename == '':
        flash('No file selected', 'danger')
        return redirect(url_for('index'))
    
    # Check file extension
    if not file.filename.endswith('.csv'):
        flash('Only CSV files are allowed', 'danger')
        return redirect(url_for('index'))
    
    try:
        # Read file into memory
        file_content = io.StringIO(file.stream.read().decode('utf-8'))
        
        # Analyze the data
        top_users, repeated_action_users = analyze_activity(file_content)
        
        # Store results in session for display
        session['top_users'] = [(user, count) for user, count in top_users]
        session['repeated_action_users'] = list(sorted(repeated_action_users))
        
        return redirect(url_for('results'))
        
    except ValueError as e:
        flash(f'Error: {str(e)}', 'danger')
        return redirect(url_for('index'))
    except Exception as e:
        flash(f'An error occurred: {str(e)}', 'danger')
        return redirect(url_for('index'))

@app.route('/results')
def results():
    """Display the analysis results."""
    # Get results from session
    top_users = session.get('top_users', [])
    repeated_action_users = session.get('repeated_action_users', [])
    
    # Clear session data
    session.pop('top_users', None)
    session.pop('repeated_action_users', None)
    
    return render_template('result.html', 
                          top_users=top_users, 
                          repeated_action_users=repeated_action_users)

if __name__ == '__main__':
    app.run(debug=True, port=5000)