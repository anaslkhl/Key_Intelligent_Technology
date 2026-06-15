//
import React from 'react';

export default function Welcome() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🚀 Key Intelligent Technology</h1>
            <p>Laravel + React + PostgreSQL</p>
            <p>Your Dockerized application is running successfully!</p>
            <div style={{ marginTop: '30px' }}>
                <h3>System Information:</h3>
                <p>Laravel Version: 10+</p>
                <p>React Version: 18+</p>
                <p>PostgreSQL Version: 15</p>
            </div>
        </div>
    );
}