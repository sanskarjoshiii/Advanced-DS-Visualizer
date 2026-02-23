#include "avl_tree.h"
#include <algorithm>
#include <cmath>

int AVLTree::getHeight(std::shared_ptr<AVLNode> node) {
    return node ? node->height : 0;
}

int AVLTree::getBalance(std::shared_ptr<AVLNode> node) {
    return node ? getHeight(node->left) - getHeight(node->right) : 0;
}

std::shared_ptr<AVLNode> AVLTree::rightRotate(std::shared_ptr<AVLNode> y) {
    auto x = y->left;
    auto T2 = x->right;
    
    x->right = y;
    y->left = T2;
    
    y->height = std::max(getHeight(y->left), getHeight(y->right)) + 1;
    x->height = std::max(getHeight(x->left), getHeight(x->right)) + 1;
    
    return x;
}

std::shared_ptr<AVLNode> AVLTree::leftRotate(std::shared_ptr<AVLNode> x) {
    auto y = x->right;
    auto T2 = y->left;
    
    y->left = x;
    x->right = T2;
    
    x->height = std::max(getHeight(x->left), getHeight(x->right)) + 1;
    y->height = std::max(getHeight(y->left), getHeight(y->right)) + 1;
    
    return y;
}

std::shared_ptr<AVLNode> AVLTree::insertNode(std::shared_ptr<AVLNode> node, int value) {
    if (!node) {
        return std::make_shared<AVLNode>(value);
    }
    
    if (value < node->value) {
        node->left = insertNode(node->left, value);
    } else if (value > node->value) {
        node->right = insertNode(node->right, value);
    } else {
        return node; // Duplicate values not allowed
    }
    
    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));
    
    int balance = getBalance(node);
    
    // Left Left Case
    if (balance > 1 && value < node->left->value) {
        return rightRotate(node);
    }
    
    // Right Right Case
    if (balance < -1 && value > node->right->value) {
        return leftRotate(node);
    }
    
    // Left Right Case
    if (balance > 1 && value > node->left->value) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    
    // Right Left Case
    if (balance < -1 && value < node->right->value) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }
    
    return node;
}

std::shared_ptr<AVLNode> AVLTree::removeNode(std::shared_ptr<AVLNode> node, int value) {
    if (!node) return nullptr;
    
    if (value < node->value) {
        node->left = removeNode(node->left, value);
    } else if (value > node->value) {
        node->right = removeNode(node->right, value);
    } else {
        if (!node->left || !node->right) {
            auto temp = node->left ? node->left : node->right;
            return temp;
        }
        
        auto temp = minValueNode(node->right);
        node->value = temp->value;
        node->right = removeNode(node->right, temp->value);
    }
    
    if (!node) return nullptr;
    
    node->height = 1 + std::max(getHeight(node->left), getHeight(node->right));
    
    int balance = getBalance(node);
    
    // Left Left Case
    if (balance > 1 && getBalance(node->left) >= 0) {
        return rightRotate(node);
    }
    
    // Left Right Case
    if (balance > 1 && getBalance(node->left) < 0) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    
    // Right Right Case
    if (balance < -1 && getBalance(node->right) <= 0) {
        return leftRotate(node);
    }
    
    // Right Left Case
    if (balance < -1 && getBalance(node->right) > 0) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }
    
    return node;
}

std::shared_ptr<AVLNode> AVLTree::minValueNode(std::shared_ptr<AVLNode> node) {
    while (node->left) {
        node = node->left;
    }
    return node;
}

bool AVLTree::searchNode(std::shared_ptr<AVLNode> node, int value) {
    if (!node) return false;
    if (value == node->value) return true;
    if (value < node->value) return searchNode(node->left, value);
    return searchNode(node->right, value);
}

crow::json::wvalue AVLTree::nodeToJson(std::shared_ptr<AVLNode> node) {
    if (!node) {
        return nullptr;
    }
    
    crow::json::wvalue json;
    json["value"] = node->value;
    json["height"] = node->height;
    json["left"] = nodeToJson(node->left);
    json["right"] = nodeToJson(node->right);
    
    return json;
}

void AVLTree::insert(int value) {
    root = insertNode(root, value);
}

void AVLTree::remove(int value) {
    root = removeNode(root, value);
}

bool AVLTree::search(int value) {
    return searchNode(root, value);
}

crow::json::wvalue AVLTree::toJson() {
    return nodeToJson(root);
}
