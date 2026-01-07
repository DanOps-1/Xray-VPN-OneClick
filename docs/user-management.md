# User Management Guide

Complete guide for managing Xray users on your server.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Adding Users](#adding-users)
- [Deleting Users](#deleting-users)
- [Viewing Users](#viewing-users)
- [Managing Multiple Users](#managing-multiple-users)
- [Best Practices](#best-practices)

---

## Overview

Xray supports multiple users on a single server. Each user has:
- Unique UUID for authentication
- Email identifier for management
- Same server configuration (port, Reality settings)

---

## Adding Users

### Using the Script

```bash
sudo bash scripts/add-user.sh <user-email>
```

Example:
```bash
sudo bash scripts/add-user.sh alice@example.com
```

### What Happens

1. ✅ Validates email format
2. ✅ Checks for duplicate users
3. ✅ Generates new UUID
4. ✅ Backs up current configuration
5. ✅ Updates config file
6. ✅ Restarts Xray service
7. ✅ Displays user information

### Output Example

```
================================
Adding Xray User
================================

Generating UUID: 12345678-1234-1234-1234-123456789012
Configuration backed up to: /var/backups/xray/config-20260107-123456.json
User added successfully
Restarting Xray service...
✅ Xray service restarted successfully

================================
✅ User added successfully!
================================

📋 User Information:
Email: alice@example.com
UUID: 12345678-1234-1234-1234-123456789012

📱 Client Configuration Parameters:
Address: YOUR_SERVER_IP
Port: 443
UUID: 12345678-1234-1234-1234-123456789012
...
```

### Manual Method

If you prefer to edit the configuration manually:

1. Generate UUID:
```bash
cat /proc/sys/kernel/random/uuid
```

2. Edit config:
```bash
sudo nano /usr/local/etc/xray/config.json
```

3. Add to `clients` array:
```json
{
  "id": "NEW_UUID",
  "flow": "xtls-rprx-vision",
  "email": "user@example.com"
}
```

4. Restart service:
```bash
sudo systemctl restart xray
```

---

## Deleting Users

### Using the Script

```bash
sudo bash scripts/del-user.sh <user-email>
```

Example:
```bash
sudo bash scripts/del-user.sh bob@example.com
```

### Confirmation Required

The script will ask for confirmation:
```
================================
Deleting Xray User
================================

⚠️  About to delete user: bob@example.com
Confirm deletion? (y/N):
```

Type `y` and press Enter to proceed.

### What Happens

1. ✅ Verifies user exists
2. ✅ Backs up configuration
3. ✅ Removes user from config
4. ✅ Restarts Xray service
5. ✅ Confirms successful deletion

---

## Viewing Users

### List All Users

```bash
sudo bash scripts/show-config.sh users
```

Output:
```
================================
User List
================================

Index  Email                          UUID
--------------------------------------------------------------------------------
1      alice@example.com             12345678-1234-1234-1234-123456789012
2      bob@example.com               87654321-4321-4321-4321-210987654321

Total users: 2
```

### View Complete Configuration

```bash
sudo bash scripts/show-config.sh all
```

Shows:
- Server information (IP, port, protocol)
- Reality configuration (SNI, Short ID)
- All users with UUIDs
- Service status
- Port listening status

### Generate User Share Link

```bash
sudo bash scripts/show-config.sh link <user-email>
```

Example:
```bash
sudo bash scripts/show-config.sh link alice@example.com
```

---

## Managing Multiple Users

### Scenario 1: Family/Friends

Recommended approach:
- Use descriptive emails: `dad@family`, `alice@family`, `bob@family`
- Keep track of who has which UUID
- Regular cleanup of unused accounts

### Scenario 2: Team/Organization

Best practices:
- Use work emails: `user@company.com`
- Document who has access
- Set up regular key rotation schedule
- Monitor usage in logs

### Checking User Activity

View connection logs:
```bash
# Live log monitoring
sudo journalctl -u xray -f

# Recent connections
sudo journalctl -u xray -n 100

# Filter by user email
sudo journalctl -u xray | grep "alice@example.com"
```

---

## Best Practices

### 1. Email Naming Convention

Use clear, identifiable emails:

✅ **Good:**
- `alice@home`
- `work-laptop@office`
- `phone-android@personal`

❌ **Bad:**
- `user1@test`
- `abc@123`
- Random strings

### 2. Regular Cleanup

Review and remove inactive users:

```bash
# List all users
sudo bash scripts/show-config.sh users

# Check logs for activity
sudo journalctl -u xray --since "30 days ago" | grep "email"

# Remove inactive users
sudo bash scripts/del-user.sh inactive@user.com
```

### 3. Security Rotation

Rotate credentials every 3-6 months:

```bash
# For each user:
# 1. Delete old user
sudo bash scripts/del-user.sh user@example.com

# 2. Add new user (generates new UUID)
sudo bash scripts/add-user.sh user@example.com

# 3. Send new configuration to user
sudo bash scripts/show-config.sh link user@example.com
```

### 4. Backup Before Changes

Always backup before modifications:

```bash
# Manual backup
sudo bash scripts/backup.sh

# The add-user and del-user scripts do this automatically
```

### 5. Limit User Count

Recommendations:
- **Personal use**: 1-5 users
- **Small team**: 5-10 users
- **Larger team**: Consider multiple servers

Too many users on one server can:
- Impact performance
- Increase security risk
- Make management difficult

### 6. Monitor Resource Usage

```bash
# Check server load
uptime

# Check memory usage
free -h

# Check network usage
sudo iftop  # or install: sudo apt install iftop
```

---

## Troubleshooting

### User Can't Connect

1. **Verify user exists:**
```bash
sudo bash scripts/show-config.sh users
```

2. **Check configuration:**
```bash
sudo bash scripts/show-config.sh link user@example.com
```

3. **Verify service is running:**
```bash
sudo systemctl status xray
```

4. **Check logs:**
```bash
sudo journalctl -u xray -f
```

### Duplicate User Error

If you try to add an existing user:
```
⚠️ Warning: User alice@example.com already exists
```

Solution:
- Delete first, then add again (changes UUID)
- Or use a different email

### Configuration Corruption

If configuration gets corrupted:

1. **Check backups:**
```bash
ls -lt /var/backups/xray/
```

2. **Restore from backup:**
```bash
sudo cp /var/backups/xray/config-TIMESTAMP.json /usr/local/etc/xray/config.json
sudo systemctl restart xray
```

3. **Verify configuration:**
```bash
sudo /usr/local/bin/xray run -test -config /usr/local/etc/xray/config.json
```

---

## Advanced Usage

### Bulk User Management

Create multiple users at once:

```bash
#!/bin/bash
users=("alice@team.com" "bob@team.com" "charlie@team.com")

for user in "${users[@]}"; do
  sudo bash scripts/add-user.sh "$user"
  sleep 2  # Wait for service restart
done
```

### Export User Configurations

Save all user info to file:

```bash
sudo bash scripts/show-config.sh all > /root/users-export.txt
```

### User Usage Statistics

Track bandwidth per user (requires additional setup):

```bash
# Monitor connections
sudo ss -tnp | grep xray

# Check logs for user activity
sudo journalctl -u xray --since today | grep "accepted"
```

---

## User Limit Recommendations

| Server Specs | Recommended Users | Maximum Users |
|--------------|-------------------|---------------|
| 1 CPU, 1GB RAM | 1-5 | 10 |
| 2 CPU, 2GB RAM | 5-15 | 30 |
| 4 CPU, 4GB RAM | 15-30 | 50 |

**Note:** Actual capacity depends on:
- User activity level
- Network bandwidth
- Server load
- Geographic location

---

## Related Documentation

- [Installation Guide](installation-guide.md)
- [Client Setup Guide](client-setup.md)
- [Main README](../README.md)

---

**Need help?** Submit an [Issue](https://github.com/DanOps-1/X-ray/issues)
