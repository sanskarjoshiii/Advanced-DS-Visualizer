#include "threaded_binary_tree.h"

std::shared_ptr<TBNode> ThreadedBinaryTree::insertNode(std::shared_ptr<TBNode> node, int value) {
    if (!node) {
        return std::make_shared<TBNode>(value);
    }

    if (value < node->value) {
        if (node->leftThread) {
            auto newNode = std::make_shared<TBNode>(value);
            newNode->left = node->left;
            newNode->right = node;
            newNode->leftThread = true;
            newNode->rightThread = true;
            node->left = newNode;
            node->leftThread = false;
        } else {
            node->left = insertNode(node->left, value);
        }
    } else if (value > node->value) {
        if (node->rightThread) {
            auto newNode = std::make_shared<TBNode>(value);
            newNode->right = node->right;
            newNode->left = node;
            newNode->leftThread = true;
            newNode->rightThread = true;
            node->right = newNode;
            node->rightThread = false;
        } else {
            node->right = insertNode(node->right, value);
        }
    }
    return node;
}

std::shared_ptr<TBNode> ThreadedBinaryTree::minValueNode(std::shared_ptr<TBNode> node) {
    while (node && !node->leftThread && node->left) {
        node = node->left;
    }
    return node;
}

std::shared_ptr<TBNode> ThreadedBinaryTree::maxValueNode(std::shared_ptr<TBNode> node) {
    while (node && !node->rightThread && node->right) {
        node = node->right;
    }
    return node;
}

std::shared_ptr<TBNode> ThreadedBinaryTree::removeNode(std::shared_ptr<TBNode> node, int value) {
    if (!node) return nullptr;

    if (value < node->value) {
        if (!node->leftThread) {
            node->left = removeNode(node->left, value);
        }
        return node;
    }
    if (value > node->value) {
        if (!node->rightThread) {
            node->right = removeNode(node->right, value);
        }
        return node;
    }

    if (node->leftThread && node->rightThread) {
        return nullptr;
    }
    if (node->leftThread) {
        auto temp = node->right;
        if (temp && temp->leftThread) {
            temp->left = node->left;
        }
        return temp;
    }
    if (node->rightThread) {
        auto temp = node->left;
        if (temp && temp->rightThread) {
            temp->right = node->right;
        }
        return temp;
    }

    auto succ = minValueNode(node->right);
    node->value = succ->value;
    node->right = removeNode(node->right, succ->value);
    return node;
}

bool ThreadedBinaryTree::searchNode(std::shared_ptr<TBNode> node, int value) {
    if (!node) return false;
    if (value == node->value) return true;
    if (value < node->value) {
        return node->leftThread ? false : searchNode(node->left, value);
    }
    return node->rightThread ? false : searchNode(node->right, value);
}

crow::json::wvalue ThreadedBinaryTree::nodeToJson(std::shared_ptr<TBNode> node) {
    if (!node) return nullptr;

    crow::json::wvalue json;
    json["value"] = node->value;
    json["leftThread"] = node->leftThread;
    json["rightThread"] = node->rightThread;
    json["left"] = (node->left && !node->leftThread) ? nodeToJson(node->left) : nullptr;
    json["right"] = (node->right && !node->rightThread) ? nodeToJson(node->right) : nullptr;

    return json;
}

void ThreadedBinaryTree::insert(int value) {
    if (!root) {
        root = std::make_shared<TBNode>(value);
        return;
    }
    insertNode(root, value);
}

void ThreadedBinaryTree::remove(int value) {
    if (!root) return;
    root = removeNode(root, value);
}

bool ThreadedBinaryTree::search(int value) {
    return searchNode(root, value);
}

crow::json::wvalue ThreadedBinaryTree::toJson() {
    return nodeToJson(root);
}
