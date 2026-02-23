#ifndef B_PLUS_TREE_H
#define B_PLUS_TREE_H

#include <vector>
#include <memory>
#include <crow/json.h>

const int ORDER = 4;

struct BPlusNode {
    bool isLeaf;
    std::vector<int> keys;
    std::vector<int> values;
    std::vector<std::shared_ptr<BPlusNode>> children;
    std::shared_ptr<BPlusNode> next;
    
    BPlusNode(bool leaf = true) : isLeaf(leaf), next(nullptr) {}
};

class BPlusTree {
private:
    std::shared_ptr<BPlusNode> root;
    
    std::shared_ptr<BPlusNode> insertNode(std::shared_ptr<BPlusNode> node, int value);
    std::shared_ptr<BPlusNode> deleteNode(std::shared_ptr<BPlusNode> node, int value);
    bool searchNode(std::shared_ptr<BPlusNode> node, int value);
    int findInsertIndex(const std::vector<int>& keys, int value);
    crow::json::wvalue nodeToJson(std::shared_ptr<BPlusNode> node);

public:
    BPlusTree() : root(nullptr) {}
    void insert(int value);
    void remove(int value);
    bool search(int value);
    crow::json::wvalue toJson();
};

#endif
