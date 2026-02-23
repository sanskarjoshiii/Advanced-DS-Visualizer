#include "b_tree.h"
#include <algorithm>

void BTree::splitChild(std::shared_ptr<BTreeNode> parent, int i) {
    auto fullChild = parent->children[i];
    auto newNode = std::make_shared<BTreeNode>(fullChild->isLeaf);
    int t = B_TREE_ORDER;
    int mid = t - 1;
    int midKey = fullChild->keys[mid];

    for (int j = 0; j < t - 1; j++) {
        newNode->keys.push_back(fullChild->keys[t + j]);
    }
    fullChild->keys.resize(mid);

    if (!fullChild->isLeaf) {
        for (int j = 0; j < t; j++) {
            newNode->children.push_back(fullChild->children[t + j]);
        }
        fullChild->children.resize(t);
    }

    parent->keys.insert(parent->keys.begin() + i, midKey);
    parent->children.insert(parent->children.begin() + i + 1, newNode);
}

void BTree::insertNonFull(std::shared_ptr<BTreeNode> node, int key) {
    int i = static_cast<int>(node->keys.size()) - 1;
    int t = B_TREE_ORDER;

    if (node->isLeaf) {
        node->keys.push_back(0);
        while (i >= 0 && node->keys[i] > key) {
            node->keys[i + 1] = node->keys[i];
            i--;
        }
        node->keys[i + 1] = key;
    } else {
        while (i >= 0 && node->keys[i] > key) i--;
        i++;
        if (node->children[i]->keys.size() == (size_t)(2 * t - 1)) {
            splitChild(node, i);
            if (key > node->keys[i]) i++;
        }
        insertNonFull(node->children[i], key);
    }
}

void BTree::insert(int key) {
    if (!root) {
        root = std::make_shared<BTreeNode>(true);
        root->keys.push_back(key);
        return;
    }
    int t = B_TREE_ORDER;
    if (root->keys.size() == (size_t)(2 * t - 1)) {
        auto newRoot = std::make_shared<BTreeNode>(false);
        newRoot->children.push_back(root);
        splitChild(newRoot, 0);
        root = newRoot;
    }
    insertNonFull(root, key);
}

bool BTree::searchNode(std::shared_ptr<BTreeNode> node, int key) {
    if (!node) return false;
    int i = 0;
    while (i < (int)node->keys.size() && key > node->keys[i]) i++;
    if (i < (int)node->keys.size() && key == node->keys[i]) return true;
    if (node->isLeaf) return false;
    return searchNode(node->children[i], key);
}

bool BTree::search(int key) {
    return searchNode(root, key);
}

int BTree::findKey(std::shared_ptr<BTreeNode> node, int key) {
    int i = 0;
    while (i < (int)node->keys.size() && node->keys[i] < key) i++;
    return i;
}

void BTree::removeFromLeaf(std::shared_ptr<BTreeNode> node, int idx) {
    node->keys.erase(node->keys.begin() + idx);
}

void BTree::removeFromNonLeaf(std::shared_ptr<BTreeNode> node, int idx) {
    int key = node->keys[idx];
    int t = B_TREE_ORDER;
    if (node->children[idx]->keys.size() >= (size_t)t) {
        int pred = getPred(node, idx);
        node->keys[idx] = pred;
        removeNode(node->children[idx], pred);
    } else if (node->children[idx + 1]->keys.size() >= (size_t)t) {
        int succ = getSucc(node, idx);
        node->keys[idx] = succ;
        removeNode(node->children[idx + 1], succ);
    } else {
        merge(node, idx);
        removeNode(node->children[idx], key);
    }
}

int BTree::getPred(std::shared_ptr<BTreeNode> node, int idx) {
    auto cur = node->children[idx];
    while (!cur->isLeaf) cur = cur->children.back();
    return cur->keys.back();
}

int BTree::getSucc(std::shared_ptr<BTreeNode> node, int idx) {
    auto cur = node->children[idx + 1];
    while (!cur->isLeaf) cur = cur->children[0];
    return cur->keys[0];
}

void BTree::fill(std::shared_ptr<BTreeNode> node, int idx) {
    int t = B_TREE_ORDER;
    if (idx != 0 && node->children[idx - 1]->keys.size() >= (size_t)t)
        borrowFromPrev(node, idx);
    else if (idx != (int)node->keys.size() && node->children[idx + 1]->keys.size() >= (size_t)t)
        borrowFromNext(node, idx);
    else {
        if (idx != (int)node->keys.size())
            merge(node, idx);
        else
            merge(node, idx - 1);
    }
}

void BTree::borrowFromPrev(std::shared_ptr<BTreeNode> node, int idx) {
    auto child = node->children[idx];
    auto sibling = node->children[idx - 1];
    child->keys.insert(child->keys.begin(), node->keys[idx - 1]);
    if (!child->isLeaf) {
        child->children.insert(child->children.begin(), sibling->children.back());
        sibling->children.pop_back();
    }
    node->keys[idx - 1] = sibling->keys.back();
    sibling->keys.pop_back();
}

void BTree::borrowFromNext(std::shared_ptr<BTreeNode> node, int idx) {
    auto child = node->children[idx];
    auto sibling = node->children[idx + 1];
    child->keys.push_back(node->keys[idx]);
    if (!child->isLeaf) {
        child->children.push_back(sibling->children[0]);
        sibling->children.erase(sibling->children.begin());
    }
    node->keys[idx] = sibling->keys[0];
    sibling->keys.erase(sibling->keys.begin());
}

void BTree::merge(std::shared_ptr<BTreeNode> node, int idx) {
    int t = B_TREE_ORDER;
    auto child = node->children[idx];
    auto sibling = node->children[idx + 1];
    child->keys.push_back(node->keys[idx]);
    for (int k : sibling->keys) child->keys.push_back(k);
    if (!child->isLeaf) {
        for (auto& c : sibling->children) child->children.push_back(c);
    }
    node->keys.erase(node->keys.begin() + idx);
    node->children.erase(node->children.begin() + idx + 1);
}

void BTree::removeNode(std::shared_ptr<BTreeNode> node, int key) {
    if (!node) return;
    int idx = findKey(node, key);
    int t = B_TREE_ORDER;

    if (idx < (int)node->keys.size() && node->keys[idx] == key) {
        if (node->isLeaf)
            removeFromLeaf(node, idx);
        else
            removeFromNonLeaf(node, idx);
        return;
    }
    if (node->isLeaf) return;

    bool lastChild = (idx == (int)node->keys.size());
    if (node->children[idx]->keys.size() < (size_t)t)
        fill(node, idx);
    if (lastChild && idx > (int)node->keys.size())
        removeNode(node->children[idx - 1], key);
    else
        removeNode(node->children[idx], key);
}

void BTree::remove(int key) {
    if (!root) return;
    removeNode(root, key);
    if (root->keys.empty()) {
        if (root->isLeaf)
            root = nullptr;
        else
            root = root->children[0];
    }
}

crow::json::wvalue BTree::nodeToJson(std::shared_ptr<BTreeNode> node) {
    if (!node) return nullptr;

    crow::json::wvalue json;
    json["isLeaf"] = node->isLeaf;
    crow::json::wvalue keys_json(crow::json::type::List);
    for (size_t i = 0; i < node->keys.size(); i++) {
        keys_json[i] = node->keys[i];
    }
    json["keys"] = std::move(keys_json);
    crow::json::wvalue children_json(crow::json::type::List);
    for (size_t i = 0; i < node->children.size(); i++) {
        children_json[i] = nodeToJson(node->children[i]);
    }
    json["children"] = std::move(children_json);
    return json;
}

crow::json::wvalue BTree::toJson() {
    return nodeToJson(root);
}
