#ifndef AVL_TREE_H
#define AVL_TREE_H

#include <memory>
#include <string>
#include <crow/json.h>

struct AVLNode {
    int value;
    int height;
    std::shared_ptr<AVLNode> left;
    std::shared_ptr<AVLNode> right;
    
    AVLNode(int val) : value(val), height(1), left(nullptr), right(nullptr) {}
};

class AVLTree {
private:
    std::shared_ptr<AVLNode> root;
    
    int getHeight(std::shared_ptr<AVLNode> node);
    int getBalance(std::shared_ptr<AVLNode> node);
    std::shared_ptr<AVLNode> rightRotate(std::shared_ptr<AVLNode> y);
    std::shared_ptr<AVLNode> leftRotate(std::shared_ptr<AVLNode> x);
    std::shared_ptr<AVLNode> insertNode(std::shared_ptr<AVLNode> node, int value);
    std::shared_ptr<AVLNode> removeNode(std::shared_ptr<AVLNode> node, int value);
    std::shared_ptr<AVLNode> minValueNode(std::shared_ptr<AVLNode> node);
    bool searchNode(std::shared_ptr<AVLNode> node, int value);
    crow::json::wvalue nodeToJson(std::shared_ptr<AVLNode> node);

public:
    AVLTree() : root(nullptr) {}
    void insert(int value);
    void remove(int value);
    bool search(int value);
    crow::json::wvalue toJson();
};

#endif
