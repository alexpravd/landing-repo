#!/bin/bash
# Fix Nginx Configuration Script

echo "Fixing nginx configuration..."

# Remove broken symlink
sudo rm /etc/nginx/sites-enabled/payload-platform

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

# If test passes, reload nginx
if [ $? -eq 0 ]; then
    echo "Configuration is valid. Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Done! Your site should now be accessible at http://145.239.84.172"
else
    echo "❌ Configuration error. Please check the output above."
fi

# Check nginx status
sudo systemctl status nginx --no-pager | head -10
