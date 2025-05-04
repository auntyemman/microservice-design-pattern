# Installing the RabbitMQ Delayed Message Exchange Plugin

## Docker Installation
If you're using Docker, you can use the official RabbitMQ image with the plugin pre-installed:

```bash
# Docker run command with the plugin enabled
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  --hostname my-rabbit \
  rabbitmq:3-management

# After container is running, install the plugin:
docker exec rabbitmq rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

## Manual Installation for a local RabbitMQ server
1. Download the plugin appropriate for your RabbitMQ version from:
   https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases

2. Copy the plugin file (.ez file) to the RabbitMQ plugins directory:
   ```
   cp rabbitmq_delayed_message_exchange-*.ez /usr/lib/rabbitmq/lib/rabbitmq_server-[version]/plugins/
   ```

3. Enable the plugin:
   ```
   rabbitmq-plugins enable rabbitmq_delayed_message_exchange
   ```

4. Restart RabbitMQ:
   ```
   systemctl restart rabbitmq-server
   ```

## Verification
To verify the plugin is installed:

1. Access the RabbitMQ Management UI (http://localhost:15672)
2. Log in (default credentials: guest/guest)
3. Go to "Admin" > "Features and plugins"
4. Look for "rabbitmq_delayed_message_exchange" in the list