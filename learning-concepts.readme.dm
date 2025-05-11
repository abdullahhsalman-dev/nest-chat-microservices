Network Types:

- Bridge default network driver create the interval private network on the host machine
- overlay  connect multiple demons and enable swarm to communicate
- Host : remove network isolation between container and host.


in docker-compose.yml

networks:
  chat-network:
    driver: bridge

You've defined a custom bridge network called chat-network
All your services are connected to this network


Network Analysis for Your Setup
docker network ls

Network Creation:

Docker Compose has created a network named nest-chat-microservices_chat-network (seen in your docker network ls output)
This is your custom chat-network prefixed with the project name


Network Architecture
Host
|
|-- nest-chat-microservices_chat-network (Bridge Network)
    |
    |-- api-gateway
    |-- auth-service
    |-- chat-service
    |-- presence-service
    |-- notification-service
    |-- mongodb
    |-- redis