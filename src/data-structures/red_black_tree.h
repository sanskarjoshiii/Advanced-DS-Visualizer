#ifndef RED_BLACK_TREE_H
#define RED_BLACK_TREE_H

#include <memory>
#include <string>
#include <crow/json.h>

enum Color { RED, BLACK };

struct RBNode {
    int value;
    Color color;
    std::shared_ptr<RBNode> left;
    std::shared_ptr<RBNode> right;
    
    RBNode(int val, Color c = RED) : value(val), color(c), left(nullptr), right(nullptr) {}
};

class RedBlackTree {
private:
    std::shared_ptr<RBNode> root;
    
    bool isRed(std::shared_ptr<RBNode> node);
    std::shared_ptr<RBNode> leftRotate(std::shared_ptr<RBNode> node);
    std::shared_ptr<RBNode> rightRotate(std::shared_ptr<RBNode> node);
    void flipColors(std::shared_ptr<RBNode> node);
    std::shared_ptr<RBNode> insertNode(std::shared_ptr<RBNode> node, int value);
    std::shared_ptr<RBNode> removeNode(std::shared_ptr<RBNode> node, int value);
    std::shared_ptr<RBNode> minValueNode(std::shared_ptr<RBNode> node);
    bool searchNode(std::shared_ptr<RBNode> node, int value);
    crow::json::wvalue nodeToJson(std::shared_ptr<RBNode> node);

public:
    RedBlackTree() : root(nullptr) {}
    void insert(int value);
    void remove(int value);
    bool search(int value);
    crow::json::wvalue toJson();
};

#endif
