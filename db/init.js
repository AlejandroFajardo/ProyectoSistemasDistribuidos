conn = new Mongo();
db = conn.getDB("records");
db.createUser(
    {
      user: "didier",
      pwd: "lanegra",
      roles: [ { role: "readWrite", db: "records" } ]
    }
);