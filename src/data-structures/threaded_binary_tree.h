#ifndef THREADED_BINARY_TREE_H
#define THREADED_BINARY_TREE_H

#include <memory>
#include <crow/json.h>

struct TBNode {
    int value;
    std::shared_ptr<TBNode> left;
    std::shared_ptr<TBNode> right;
    bool leftThread;   // true if left is thread to inorder predecessor
    bool rightThread;  // true if right is thread to inorder successor

    TBNode(int val) : value(val), left(nullptr), right(nullptr), leftThread(true), rightThread(true) {}
};

class ThreadedBinaryTree {
private:
    std::shared_ptr<TBNode> root;

    std::shared_ptr<TBNode> insertNode(std::shared_ptr<TBNode> node, int value);
    std::shared_ptr<TBNode> removeNode(std::shared_ptr<TBNode> node, int value);
    std::shared_ptr<TBNode> minValueNode(std::shared_ptr<TBNode> node);
    std::shared_ptr<TBNode> maxValueNode(std::shared_ptr<TBNode> node);
    bool searchNode(std::shared_ptr<TBNode> node, int value);
    crow::json::wvalue nodeToJson(std::shared_ptr<TBNode> node);

public:
    ThreadedBinaryTree() : root(nullptr) {}
    void insert(int value);
    void remove(int value);
    bool search(int value);
    crow::json::wvalue toJson();
};

#endif
