#include <iostream>
#include <string>
#include <cstring>

#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

using namespace std;

int main(int argc, char* argv[]) {

```
// Usage:
// ./backend_server <port> <server-name>
// argv format -> backend_server 8001 server-1
if (argc != 3) {
    // Return error
    cerr << "Usage: ./backend_server <port> <server-name>\n";
    return 1;// return 1 for error, 0 for success
}

int port = stoi(argv[1]);
string serverName = argv[2];

// Create TCP Socket in cpp
// AF_INET=IPv4
// SOCK_STREAM for TCP
// SOCK_DGRAM for UDP

int serverSocket = socket(
    AF_INET,
    SOCK_STREAM,
    0
);

if (serverSocket < 0) {
    perror("socket");
    return 1;
}

// Allow port reuse

int opt = 1;

setsockopt(
    serverSocket,
    SOL_SOCKET,
    SO_REUSEADDR,
    &opt,
    sizeof(opt)
);

// Define server address

sockaddr_in serverAddress{};

// Specify Ipv4
serverAddress.sin_family = AF_INET;

// Accept connections from anywhere
serverAddress.sin_addr.s_addr = INADDR_ANY;

// Convert port to network byte order
serverAddress.sin_port = htons(port);

// Bind socket to IP + port

if (bind(
        serverSocket,
        (struct sockaddr*)&serverAddress,
        sizeof(serverAddress)
    ) < 0) {
    perror("bind");
    close(serverSocket);
    return 1;
}

// Start listening

if (listen(serverSocket, 10) < 0) {
    perror("listen");
    close(serverSocket);
    return 1;
}

cout << serverName
     << " running on port "
     << port
     << endl;

// Accept clients or Requests continiously

// serverSocket → keeps listening for new clients
// clientSocket → communicates with THIS client

while (true) {
    cout << "Waiting for connection...\n";
    int clientSocket = accept(
        serverSocket,
        nullptr,
        nullptr
    );

    if (clientSocket < 0) {
        perror("accept");
        continue;
    }

    cout << "Client connected!\n";


    // Receive HTTP request

    char buffer[4096];

    int bytesReceived = recv(
        clientSocket,
        buffer,
        sizeof(buffer) - 1,
        0
    );

    if (bytesReceived <= 0) {
        close(clientSocket);
        continue;
    }

    buffer[bytesReceived] = '\0';

    cout << "\nRequest received:\n";
    cout << buffer << endl;

    // Create HTTP response

    string body =
        "Hello from " + serverName + "\n";

    string response =
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/plain\r\n"
        "Content-Length: " + to_string(body.size()) + "\r\n"
        "Connection: close\r\n"
        "\r\n" +
        body;

    // Send response

    send(
        clientSocket,
        response.c_str(),
        response.size(),
        0
    );

    // Close client connection

    close(clientSocket);

    cout << "Client disconnected.\n\n";
}

// This wonft normally be reached
close(serverSocket);

return 0;
```

}
