#include "red_black_tree.h"
#include <algorithm>

bool RedBlackTree::isRed(std::shared_ptr<RBNode> node) {
    return node && node->color == RED;
}

std::shared_ptr<RBNode> RedBlackTree::leftRotate(std::shared_ptr<RBNode> node) {
    auto right = node->right;
    node->right = right->left;
    right->left = node;
    right->color = node->color;
    node->color = RED;
    return right;
}

std::shared_ptr<RBNode> RedBlackTree::rightRotate(std::shared_ptr<RBNode> node) {
    auto left = node->left;
    node->left = left->right;
    left->right = node;
    left->color = node->color;
    node->color = RED;
    return left;
}

void RedBlackTree::flipColors(std::shared_ptr<RBNode> node) {
    node->color = RED;
    if (node->left) node->left->color = BLACK;
    if (node->right) node->right->color = BLACK;
}

std::shared_ptr<RBNode> RedBlackTree::insertNode(std::shared_ptr<RBNode> node, int value) {
    if (!node) {
        return std::make_shared<RBNode>(value, RED);
    }
    
    if (value < node->value) {
        node->left = insertNode(node->left, value);
    } else if (value > node->value) {
        node->right = insertNode(node->right, value);
    } else {
        return node;
    }
    
    // Fix Red-Black violations
    if (isRed(node->right) && !isRed(node->left)) {
        node = leftRotate(node);
    }
    if (isRed(node->left) && node->left && isRed(node->left->left)) {
        node = rightRotate(node);
    }
    if (isRed(node->left) && isRed(node->right)) {
        flipColors(node);
    }
    
    return node;
}

std::shared_ptr<RBNode> RedBlackTree::removeNode(std::shared_ptr<RBNode> node, int value) {
    if (!node) return nullptr;
    
    if (value < node->value) {
        node->left = removeNode(node->left, value);
    } else if (value > node->value) {
        node->right = removeNode(node->right, value);
    } else {
        if (!node->left || !node->right) {
            return node->left ? node->left : node->right;
        }
        auto minNode = minValueNode(node->right);
        node->value = minNode->value;
        node->right = removeNode(node->right, minNode->value);
    }
    
    // Fix Red-Black violations
    if (isRed(node->right) && !isRed(node->left)) {
        node = leftRotate(node);
    }
    if (isRed(node->left) && node->left && isRed(node->left->left)) {
        node = rightRotate(node);
    }
    if (isRed(node->left) && isRed(node->right)) {
        flipColors(node);
    }
    
    return node;
}

std::shared_ptr<RBNode> RedBlackTree::minValueNode(std::shared_ptr<RBNode> node) {
    while (node->left) {
        node = node->left;
    }
    return node;
}

bool RedBlackTree::searchNode(std::shared_ptr<RBNode> node, int value) {
    if (!node) return false;
    if (value == node->value) return true;
    if (value < node->value) return searchNode(node->left, value);
    return searchNode(node->right, value);
}

crow::json::wvalue RedBlackTree::nodeToJson(std::shared_ptr<RBNode> node) {
    if (!node) {
        return nullptr;
    }
    
    crow::json::wvalue json;
    json["value"] = node->value;
    json["color"] = node->color == RED ? "RED" : "BLACK";
    json["left"] = nodeToJson(node->left);
    json["right"] = nodeToJson(node->right);
    
    return json;
}

void RedBlackTree::insert(int value) {
    root = insertNode(root, value);
    if (root) root->color = BLACK;
}

void RedBlackTree::remove(int value) {
    root = removeNode(root, value);
    if (root) root->color = BLACK;
}

bool RedBlackTree::search(int value) {
    return searchNode(root, value);
}

crow::json::wvalue RedBlackTree::toJson() {
    return nodeToJson(root);
}
