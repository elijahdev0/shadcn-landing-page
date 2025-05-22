/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "oauth2": {
      "enabled": true
    },
    "otp": {
      "duration": 500,
      "enabled": true,
      "length": 4
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "oauth2": {
      "enabled": false
    },
    "otp": {
      "duration": 180,
      "enabled": false,
      "length": 8
    }
  }, collection)

  return app.save(collection)
})
