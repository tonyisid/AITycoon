#!/bin/bash
# Setup PostgreSQL password

echo "Setting PostgreSQL password..."

# Set password for postgres user
sudo -u postgres psql << EOF
ALTER USER postgres PASSWORD 'postgres';
EOF

# Update pg_hba.conf to use md5 authentication
sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/' /var/lib/pgsql/data/pg_hba.conf

# Reload PostgreSQL
sudo systemctl reload postgresql

echo "PostgreSQL password configured!"
echo "User: postgres"
echo "Password: postgres"
