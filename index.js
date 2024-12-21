// Import the HTTP module
const http = require("http");

// Initial phone data
const phones = [
  { id: 1, name: "iPhone 14", brand: "Apple", price: 1200, stock: 10 },
  { id: 2, name: "Galaxy S23", brand: "Samsung", price: 900, stock: 5 },
  { id: 3, name: "Pixel 7", brand: "Google", price: 700, stock: 8 },
];

// Helper function to parse JSON request body
const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const [path, queryString] = url.split("?");

  // Parse query parameters
  const queryParams = new URLSearchParams(queryString);
  const brandFilter = queryParams.get("brand");
  const maxPriceFilter = queryParams.get("maxPrice");

  // Set default headers
  res.setHeader("Content-Type", "application/json");

  // Routes
  if (method === "GET" && path === "/phones") {
    let filteredPhones = [...phones];

    if (brandFilter) {
      filteredPhones = filteredPhones.filter(
        (phone) => phone.brand === brandFilter
      );
    }

    if (maxPriceFilter) {
      filteredPhones = filteredPhones.filter(
        (phone) => phone.price <= parseFloat(maxPriceFilter)
      );
    }

    res.writeHead(200);
    res.end(JSON.stringify(filteredPhones));
  } else if (method === "GET" && path.startsWith("/phones/")) {
    const id = parseInt(path.split("/")[2]);
    const phone = phones.find((phone) => phone.id === id);

    if (!phone) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Phone not found" }));
    } else {
      res.writeHead(200);
      res.end(JSON.stringify(phone));
    }
  } else if (method === "POST" && path === "/phones") {
    try {
      const body = await parseRequestBody(req);
      const { name, brand, price, stock } = body;

      if (
        !name ||
        !brand ||
        typeof price !== "number" ||
        typeof stock !== "number"
      ) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid input data" }));
        return;
      }

      const newPhone = {
        id: phones.length ? phones[phones.length - 1].id + 1 : 1,
        name,
        brand,
        price,
        stock,
      };

      phones.push(newPhone);
      res.writeHead(201);
      res.end(JSON.stringify(newPhone));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  } else if (method === "PUT" && path.startsWith("/phones/")) {
    try {
      const id = parseInt(path.split("/")[2]);
      const phone = phones.find((phone) => phone.id === id);

      if (!phone) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Phone not found" }));
        return;
      }

      const body = await parseRequestBody(req);
      const { name, brand, price, stock } = body;

      if (
        !name &&
        !brand &&
        typeof price !== "number" &&
        typeof stock !== "number"
      ) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "No fields to update" }));
        return;
      }

      if (name) phone.name = name;
      if (brand) phone.brand = brand;
      if (typeof price === "number") phone.price = price;
      if (typeof stock === "number") phone.stock = stock;

      res.writeHead(200);
      res.end(JSON.stringify(phone));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  } else if (method === "DELETE" && path.startsWith("/phones/")) {
    const id = parseInt(path.split("/")[2]);
    const index = phones.findIndex((phone) => phone.id === id);

    if (index === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Phone not found" }));
    } else {
      const deletedPhone = phones.splice(index, 1)[0];
      res.writeHead(200);
      res.end(JSON.stringify(deletedPhone));
    }
  } else {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }
});

// Start the server
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
