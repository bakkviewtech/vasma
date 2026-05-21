const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const JWT_SECRET = 'vasma_secret_key_2024_change_this_in_production';
const TOKEN_EXPIRY = '8h';

// Initialize admin user if not exists
async function initializeAdminUser() {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    try {
        // Check if admin exists in app_settings
        const [rows] = await db.query(
            'SELECT settings_json FROM app_settings WHERE id = 1'
        );
        
        let users = [];
        if (rows.length > 0) {
            const settings = rows[0].settings_json;
            users = settings.users || [];
        }
        
        const adminExists = users.find(u => u.username === adminUsername);
        
        if (!adminExists) {
            // Hash password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            // Add admin user
            users.push({
                id: 'admin_1',
                username: adminUsername,
                password: hashedPassword,
                name: 'Administrator',
                role: 'admin',
                created_at: new Date().toISOString()
            });
            
            // Update app_settings
            const settingsJSON = rows.length > 0 ? rows[0].settings_json : {};
            settingsJSON.users = users;
            
            if (rows.length > 0) {
                await db.query(
                    'UPDATE app_settings SET settings_json = ? WHERE id = 1',
                    [JSON.stringify(settingsJSON)]
                );
            } else {
                await db.query(
                    'INSERT INTO app_settings (id, settings_json) VALUES (1, ?)',
                    [JSON.stringify(settingsJSON)]
                );
            }
            
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error initializing admin user:', error);
    }
}

// Login endpoint
async function login(req, res) {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }
    
    try {
        // Get users from app_settings
        const [rows] = await db.query(
            'SELECT settings_json FROM app_settings WHERE id = 1'
        );
        
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const settings = rows[0].settings_json;
        const users = settings.users || [];
        
        // Find user
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        
        // Return user info (without password)
        const userInfo = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        };
        
        res.json({
            success: true,
            token: token,
            user: userInfo,
            message: 'Login successful'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// Verify token middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Change password endpoint
async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Old and new password are required'
        });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters'
        });
    }
    
    try {
        // Get users
        const [rows] = await db.query(
            'SELECT settings_json FROM app_settings WHERE id = 1'
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }
        
        const settings = rows[0].settings_json;
        let users = settings.users || [];
        
        // Find user
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify old password
        const isValidOldPassword = await bcrypt.compare(oldPassword, users[userIndex].password);
        
        if (!isValidOldPassword) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        users[userIndex].password = hashedNewPassword;
        
        // Update settings
        settings.users = users;
        await db.query(
            'UPDATE app_settings SET settings_json = ? WHERE id = 1',
            [JSON.stringify(settings)]
        );
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {
    initializeAdminUser,
    login,
    verifyToken,
    changePassword
};