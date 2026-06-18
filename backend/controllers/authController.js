import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    console.log(`\n--- [REGISTER ATTEMPT] ---`);
    console.log(`Raw Body:`, req.body);
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    
    console.log(`Processed -> Username: '${username}', Email: '${email}'`);
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log(`[REGISTER FAILED] User already exists:`, existingUser.username, existingUser.email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log(`[REGISTER SUCCESS] User saved to DB with ID:`, user._id);
    
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(`[REGISTER ERROR]`, err.message);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log(`\n--- [LOGIN ATTEMPT] ---`);
    console.log(`Raw Body:`, req.body);
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    
    console.log(`Processed -> Email: '${email}'`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN FAILED] User not found. Let's check who is in the DB...`);
      const allUsers = await User.find({}).select('-password');
      console.log(`Current users in Database:`, allUsers);
      return res.status(400).json({ message: 'User not found' });
    }
    
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      console.log(`[LOGIN FAILED] Invalid password for user:`, email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log(`[LOGIN SUCCESS] Welcome back,`, user.username);
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(`[LOGIN ERROR]`, err.message);
    res.status(500).json({ error: err.message });
  }
};
