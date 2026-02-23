#include "b_plus_tree.h"
#include <algorithm>

int BPlusTree::findInsertIndex(const std::vector<int>& keys, int value) {
    int index = 0;
    while (index < keys.size() && keys[index] < value) {
        index++;
    }
    return index;
}

std::shared_ptr<BPlusNode> BPlusTree::insertNode(std::shared_ptr<BPlusNode> node, int value) {
    if (!node) {
        auto newNode = std::make_shared<BPlusNode>(true);
        newNode->keys.push_back(value);
        newNode->values.push_back(value);
        return newNode;
    }
    
    if (node->isLeaf) {
        int index = findInsertIndex(node->keys, value);
        node->keys.insert(node->keys.begin() + index, value);
        node->values.insert(node->values.begin() + index, value);
        
        if (node->keys.size() > ORDER - 1) {
            // Split leaf
            int mid = node->keys.size() / 2;
            auto rightNode = std::make_shared<BPlusNode>(true);
            rightNode->keys.assign(node->keys.begin() + mid, node->keys.end());
            rightNode->values.assign(node->values.begin() + mid, node->values.end());
            rightNode->next = node->next;
            
            node->keys.erase(node->keys.begin() + mid, node->keys.end());
            node->values.erase(node->values.begin() + mid, node->values.end());
            node->next = rightNode;
            
            return rightNode;
        }
        return nullptr;
    } else {
        int index = 0;
        while (index < node->keys.size() && value >= node->keys[index]) {
            index++;
        }
        
        auto result = insertNode(node->children[index], value);
        if (result) {
            node->keys.insert(node->keys.begin() + index, result->keys[0]);
            node->children.insert(node->children.begin() + index + 1, result);
            
            if (node->keys.size() > ORDER - 1) {
                int mid = node->keys.size() / 2;
                auto rightNode = std::make_shared<BPlusNode>(false);
                rightNode->keys.assign(node->keys.begin() + mid + 1, node->keys.end());
                rightNode->children.assign(node->children.begin() + mid + 1, node->children.end());
                
                int midKey = node->keys[mid];
                node->keys.erase(node->keys.begin() + mid, node->keys.end());
                node->children.erase(node->children.begin() + mid + 1, node->children.end());
                
                auto newRoot = std::make_shared<BPlusNode>(false);
                newRoot->keys.push_back(midKey);
                newRoot->children.push_back(node);
                newRoot->children.push_back(rightNode);
                
                return newRoot;
            }
        }
        return nullptr;
    }
}

std::shared_ptr<BPlusNode> BPlusTree::deleteNode(std::shared_ptr<BPlusNode> node, int value) {
    if (!node) return nullptr;
    
    if (node->isLeaf) {
        auto it = std::find(node->keys.begin(), node->keys.end(), value);
        if (it != node->keys.end()) {
            int index = it - node->keys.begin();
            node->keys.erase(node->keys.begin() + index);
            node->values.erase(node->values.begin() + index);
        }
        return node;
    } else {
        int index = 0;
        while (index < node->keys.size() && value >= node->keys[index]) {
            index++;
        }
        return deleteNode(node->children[index], value);
    }
}

bool BPlusTree::searchNode(std::shared_ptr<BPlusNode> node, int value) {
    if (!node) return false;
    
    if (node->isLeaf) {
        return std::find(node->keys.begin(), node->keys.end(), value) != node->keys.end();
    } else {
        int index = 0;
        while (index < node->keys.size() && value >= node->keys[index]) {
            index++;
        }
        return searchNode(node->children[index], value);
    }
}

crow::json::wvalue BPlusTree::nodeToJson(std::shared_ptr<BPlusNode> node) {
    if (!node) {
        return nullptr;
    }
    
    crow::json::wvalue json;
    json["isLeaf"] = node->isLeaf;
    
    crow::json::wvalue keys_json(crow::json::type::List);
    for (size_t i = 0; i < node->keys.size(); i++) {
        keys_json[i] = node->keys[i];
    }
    json["keys"] = std::move(keys_json);
    
    if (node->isLeaf) {
        crow::json::wvalue values_json(crow::json::type::List);
        for (size_t i = 0; i < node->values.size(); i++) {
            values_json[i] = node->values[i];
        }
        json["values"] = std::move(values_json);
    }
    
    crow::json::wvalue children_json(crow::json::type::List);
    for (size_t i = 0; i < node->children.size(); i++) {
        children_json[i] = nodeToJson(node->children[i]);
    }
    json["children"] = std::move(children_json);
    
    return json;
}

void BPlusTree::insert(int value) {
    if (!root) {
        root = std::make_shared<BPlusNode>(true);
        root->keys.push_back(value);
        root->values.push_back(value);
    } else {
        auto result = insertNode(root, value);
        if (result) {
            if (result->isLeaf) {
                // Root leaf split: wrap both halves in a new internal root
                auto newRoot = std::make_shared<BPlusNode>(false);
                newRoot->keys.push_back(result->keys[0]);
                newRoot->children.push_back(root);
                newRoot->children.push_back(result);
                root = newRoot;
            } else {
                // Internal node split returned a complete new root
                root = result;
            }
        }
    }
}

void BPlusTree::remove(int value) {
    if (root) {
        root = deleteNode(root, value);
        if (root && root->keys.empty() && !root->isLeaf) {
            root = root->children.empty() ? nullptr : root->children[0];
        }
    }
}

bool BPlusTree::search(int value) {
    return searchNode(root, value);
}

crow::json::wvalue BPlusTree::toJson() {
    return nodeToJson(root);
}
