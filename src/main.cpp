#include "crow.h"
#include "data-structures/avl_tree.h"
#include "data-structures/red_black_tree.h"
#include "data-structures/b_plus_tree.h"
#include "data-structures/threaded_binary_tree.h"
#include "data-structures/heap_tree.h"
#include "data-structures/b_tree.h"
#include <memory>
#include <map>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>

using namespace std;

// Global instances of data structures
map<string, unique_ptr<AVLTree>> avl_trees;
map<string, unique_ptr<RedBlackTree>> rb_trees;
map<string, unique_ptr<BPlusTree>> bplus_trees;
map<string, unique_ptr<ThreadedBinaryTree>> threaded_trees;
map<string, unique_ptr<HeapTree>> heaps;
map<string, unique_ptr<BTree>> btrees;

string getSessionId(const crow::request& req) {
    return "default";
}

crow::response makeJson(int code, crow::json::wvalue body) {
    auto res = crow::response(code);
    res.set_header("Content-Type", "application/json");
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
    res.body = body.dump();
    return res;
}

crow::response makeCorsOk() {
    auto res = crow::response(200);
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
    return res;
}

int main() {
    auto app = crow::SimpleApp();

    // Serve index.html
    CROW_ROUTE(app, "/")
    ([]() {
        std::ifstream file("static/index.html");
        if (!file) return crow::response(404);
        std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
        auto res = crow::response(200);
        res.set_header("Content-Type", "text/html");
        res.set_header("Access-Control-Allow-Origin", "*");
        res.body = content;
        return res;
    });

    // ==================== AVL Tree ====================
    CROW_ROUTE(app, "/api/avl/insert").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (avl_trees.find(session) == avl_trees.end())
            avl_trees[session] = make_unique<AVLTree>();
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        avl_trees[session]->insert((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", avl_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/avl/delete").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (avl_trees.find(session) == avl_trees.end())
            return makeJson(200, {{"success", true}, {"tree", nullptr}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        avl_trees[session]->remove((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", avl_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/avl/search").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (avl_trees.find(session) == avl_trees.end())
            return makeJson(200, {{"found", false}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        bool found = avl_trees[session]->search((int)body["value"].i());
        return makeJson(200, {{"found", found}});
    });

    CROW_ROUTE(app, "/api/avl/tree").methods("GET"_method)
    ([](const crow::request& req) {
        auto session = getSessionId(req);
        if (avl_trees.find(session) == avl_trees.end())
            return makeJson(200, {{"tree", nullptr}});
        return makeJson(200, {{"tree", avl_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/avl/clear").methods("POST"_method, "GET"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        avl_trees[session] = make_unique<AVLTree>();
        return makeJson(200, {{"success", true}});
    });

    // ==================== Red-Black Tree ====================
    CROW_ROUTE(app, "/api/rbtree/insert").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (rb_trees.find(session) == rb_trees.end())
            rb_trees[session] = make_unique<RedBlackTree>();
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        rb_trees[session]->insert((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", rb_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/rbtree/delete").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (rb_trees.find(session) == rb_trees.end())
            return makeJson(200, {{"success", true}, {"tree", nullptr}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        rb_trees[session]->remove((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", rb_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/rbtree/search").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (rb_trees.find(session) == rb_trees.end())
            return makeJson(200, {{"found", false}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        bool found = rb_trees[session]->search((int)body["value"].i());
        return makeJson(200, {{"found", found}});
    });

    CROW_ROUTE(app, "/api/rbtree/tree").methods("GET"_method)
    ([](const crow::request& req) {
        auto session = getSessionId(req);
        if (rb_trees.find(session) == rb_trees.end())
            return makeJson(200, {{"tree", nullptr}});
        return makeJson(200, {{"tree", rb_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/rbtree/clear").methods("POST"_method, "GET"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        rb_trees[session] = make_unique<RedBlackTree>();
        return makeJson(200, {{"success", true}});
    });

    // ==================== B+ Tree ====================
    CROW_ROUTE(app, "/api/bplus/insert").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (bplus_trees.find(session) == bplus_trees.end())
            bplus_trees[session] = make_unique<BPlusTree>();
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        bplus_trees[session]->insert((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", bplus_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/bplus/delete").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (bplus_trees.find(session) == bplus_trees.end())
            return makeJson(200, {{"success", true}, {"tree", nullptr}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        bplus_trees[session]->remove((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", bplus_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/bplus/search").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (bplus_trees.find(session) == bplus_trees.end())
            return makeJson(200, {{"found", false}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        bool found = bplus_trees[session]->search((int)body["value"].i());
        return makeJson(200, {{"found", found}});
    });

    CROW_ROUTE(app, "/api/bplus/tree").methods("GET"_method)
    ([](const crow::request& req) {
        auto session = getSessionId(req);
        if (bplus_trees.find(session) == bplus_trees.end())
            return makeJson(200, {{"tree", nullptr}});
        return makeJson(200, {{"tree", bplus_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/bplus/clear").methods("POST"_method, "GET"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        bplus_trees[session] = make_unique<BPlusTree>();
        return makeJson(200, {{"success", true}});
    });

    // ==================== Threaded Binary Tree ====================
    CROW_ROUTE(app, "/api/threaded/insert").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (threaded_trees.find(session) == threaded_trees.end())
            threaded_trees[session] = make_unique<ThreadedBinaryTree>();
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        threaded_trees[session]->insert((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", threaded_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/threaded/delete").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (threaded_trees.find(session) == threaded_trees.end())
            return makeJson(200, {{"success", true}, {"tree", nullptr}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        threaded_trees[session]->remove((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", threaded_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/threaded/search").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (threaded_trees.find(session) == threaded_trees.end())
            return makeJson(200, {{"found", false}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        bool found = threaded_trees[session]->search((int)body["value"].i());
        return makeJson(200, {{"found", found}});
    });

    CROW_ROUTE(app, "/api/threaded/tree").methods("GET"_method)
    ([](const crow::request& req) {
        auto session = getSessionId(req);
        if (threaded_trees.find(session) == threaded_trees.end())
            return makeJson(200, {{"tree", nullptr}});
        return makeJson(200, {{"tree", threaded_trees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/threaded/clear").methods("POST"_method, "GET"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        threaded_trees[session] = make_unique<ThreadedBinaryTree>();
        return makeJson(200, {{"success", true}});
    });

    // ==================== Heap Tree ====================
    CROW_ROUTE(app, "/api/heap/insert").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (heaps.find(session) == heaps.end())
            heaps[session] = make_unique<HeapTree>();
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        heaps[session]->insert((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", heaps[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/heap/extract").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (heaps.find(session) == heaps.end() || heaps[session]->isEmpty())
            return makeJson(200, {{"success", false}, {"error", "Heap is empty"}, {"tree", nullptr}});
        int minVal = heaps[session]->extractMin();
        return makeJson(200, {{"success", true}, {"min", minVal}, {"tree", heaps[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/heap/tree").methods("GET"_method)
    ([](const crow::request& req) {
        auto session = getSessionId(req);
        if (heaps.find(session) == heaps.end())
            return makeJson(200, {{"tree", nullptr}});
        return makeJson(200, {{"tree", heaps[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/heap/clear").methods("POST"_method, "GET"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        heaps[session] = make_unique<HeapTree>();
        return makeJson(200, {{"success", true}});
    });

    // ==================== B-Tree ====================
    CROW_ROUTE(app, "/api/btree/insert").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (btrees.find(session) == btrees.end())
            btrees[session] = make_unique<BTree>();
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        btrees[session]->insert((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", btrees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/btree/delete").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (btrees.find(session) == btrees.end())
            return makeJson(200, {{"success", true}, {"tree", nullptr}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        btrees[session]->remove((int)body["value"].i());
        return makeJson(200, {{"success", true}, {"tree", btrees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/btree/search").methods("POST"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        if (btrees.find(session) == btrees.end())
            return makeJson(200, {{"found", false}});
        auto body = crow::json::load(req.body);
        if (!body || !body.has("value"))
            return makeJson(400, {{"error", "Missing value"}});
        bool found = btrees[session]->search((int)body["value"].i());
        return makeJson(200, {{"found", found}});
    });

    CROW_ROUTE(app, "/api/btree/tree").methods("GET"_method)
    ([](const crow::request& req) {
        auto session = getSessionId(req);
        if (btrees.find(session) == btrees.end())
            return makeJson(200, {{"tree", nullptr}});
        return makeJson(200, {{"tree", btrees[session]->toJson()}});
    });

    CROW_ROUTE(app, "/api/btree/clear").methods("POST"_method, "GET"_method, "OPTIONS"_method)
    ([](const crow::request& req) {
        if (req.method == "OPTIONS"_method) return makeCorsOk();
        auto session = getSessionId(req);
        btrees[session] = make_unique<BTree>();
        return makeJson(200, {{"success", true}});
    });

    // Serve static files
    CROW_ROUTE(app, "/<path>")
    ([](const crow::request& req, string path) {
        if (path.find("..") != string::npos)
            return crow::response(403);
        string filepath = "static/" + path;
        ifstream file(filepath);
        if (!file)
            return crow::response(404);
        string content((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());
        string content_type = "text/plain";
        if (path.size() >= 5 && path.substr(path.size() - 5) == ".html") content_type = "text/html";
        else if (path.size() >= 4 && path.substr(path.size() - 4) == ".css") content_type = "text/css";
        else if (path.size() >= 3 && path.substr(path.size() - 3) == ".js") content_type = "application/javascript";
        else if (path.size() >= 5 && path.substr(path.size() - 5) == ".json") content_type = "application/json";
        auto res = crow::response(200);
        res.set_header("Content-Type", content_type);
        res.set_header("Access-Control-Allow-Origin", "*");
        res.body = content;
        return res;
    });

    std::cout << "\n====================================\n";
    std::cout << "  ADS Visualization is running!\n";
    std::cout << "  Open: http://localhost:18080\n";
    std::cout << "====================================\n\n";

    const char* port_env = std::getenv("PORT");
    int port = port_env ? std::atoi(port_env) : 18080;
    std::cout << "  Port: " << port << "\n";
    app.port(port).multithreaded().run();
    return 0;
}
