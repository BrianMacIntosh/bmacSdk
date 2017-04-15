/**
 * @fileOverview Contains utility functions for interacting with Box2D.
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var box2d_1 = require("../thirdparty/box2d");
var PhysicsLinkedObject_1 = require("./PhysicsLinkedObject");
exports.PhysicsLinkedObject = PhysicsLinkedObject_1.PhysicsLinkedObject;
var b2ContactListener = (function (_super) {
    __extends(b2ContactListener, _super);
    function b2ContactListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    b2ContactListener.prototype.BeginContact = function (contact) {
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var objectA = fixtureA.GetBody().GetUserData();
        var objectB = fixtureB.GetBody().GetUserData();
        if (objectA)
            objectA.onBeginContact(contact, fixtureB);
        if (objectB)
            objectB.onBeginContact(contact, fixtureA);
    };
    b2ContactListener.prototype.EndContact = function (contact) {
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var objectA = fixtureA.GetBody().GetUserData();
        var objectB = fixtureB.GetBody().GetUserData();
        if (objectA)
            objectA.onEndContact(contact, fixtureB);
        if (objectB)
            objectB.onEndContact(contact, fixtureA);
    };
    b2ContactListener.prototype.PreSolve = function (contact, oldManifold) {
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var objectA = fixtureA.GetBody().GetUserData();
        var objectB = fixtureB.GetBody().GetUserData();
        if (objectA)
            objectA.onPreSolve(contact, oldManifold, fixtureB);
        if (objectB)
            objectB.onPreSolve(contact, oldManifold, fixtureA);
    };
    b2ContactListener.prototype.PostSolve = function (contact, impulse) {
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var objectA = fixtureA.GetBody().GetUserData();
        var objectB = fixtureB.GetBody().GetUserData();
        if (objectA)
            objectA.onPostSolve(contact, impulse, fixtureB);
        if (objectB)
            objectB.onPostSolve(contact, impulse, fixtureA);
    };
    return b2ContactListener;
}(box2d_1.Box2D.b2ContactListener));
exports.b2ContactListener = b2ContactListener;
var b2ContactFilter = (function (_super) {
    __extends(b2ContactFilter, _super);
    function b2ContactFilter(shouldCollide) {
        var _this = _super.call(this) || this;
        _this.shouldCollide = shouldCollide;
        return _this;
    }
    b2ContactFilter.prototype.ShouldCollide = function (fixtureA, fixtureB) {
        return this.shouldCollide(fixtureA, fixtureB);
    };
    return b2ContactFilter;
}(box2d_1.Box2D.b2ContactFilter));
exports.b2ContactFilter = b2ContactFilter;
var Box2DManager = (function () {
    function Box2DManager() {
        //TODO: replace with matrices below
        this.B2_SCALE = 50;
        this.Box2DToGame = new THREE.Matrix4();
        this.GameToBox2D = new THREE.Matrix4();
        /**
         * List of all PhysicsLinkedObject that exist.
         * @type {PhysicsLinkedObject[]}
         */
        this.AllObjects = [];
        /**
         * Temporary vector used for math, to prevent garbage allocation. Use only VERY locally.
         * @type {Box2D.b2Vec2}
         */
        this.tempVector2 = new box2d_1.Box2D.b2Vec2();
        this.filter_all = new box2d_1.Box2D.b2FilterData();
        this.filter_none = new box2d_1.Box2D.b2FilterData();
        this.staticBodyDef = new box2d_1.Box2D.b2BodyDef();
        this.dynamicBodyDef = new box2d_1.Box2D.b2BodyDef();
        this.kinematicBodyDef = new box2d_1.Box2D.b2BodyDef();
        this.filter_all.maskBits = 0xFFFF;
        this.filter_all.categoryBits = 0xFFFF;
        this.filter_none.maskBits = 0;
        this.filter_none.categoryBits = 0;
        this.dynamicBodyDef.type = box2d_1.Box2D.b2Body.b2_dynamicBody;
        this.kinematicBodyDef.type = box2d_1.Box2D.b2Body.b2_kinematicBody;
    }
    /**
     * Creates an edge shape.
     * @param {number} x1 First x coordinate in world units.
     * @param {number} y1 First y coordinate in world units.
     * @param {number} x2 Second x coordinate in world units.
     * @param {number} y2 Second y coordinate in world units.
     * @returns {Box2D.b2Shape}
     */
    Box2DManager.prototype.createEdgeShape = function (x1, y1, x2, y2) {
        var shape = new box2d_1.Box2D.b2PolygonShape();
        shape.SetAsEdge(new box2d_1.Box2D.b2Vec2(x1 / this.B2_SCALE, y1 / this.B2_SCALE), new box2d_1.Box2D.b2Vec2(x2 / this.B2_SCALE, y2 / this.B2_SCALE));
        return shape;
    };
    /**
     * Creates a rectangle shape.
     * @param {number} w The width of the rectangle in world units.
     * @param {number} h The height of the rectangle in world units.
     * @returns {Box2D.b2Shape}
     */
    Box2DManager.prototype.createRectShape = function (w, h) {
        var shape = new box2d_1.Box2D.b2PolygonShape();
        shape.SetAsBox(0.5 * w / this.B2_SCALE, 0.5 * h / this.B2_SCALE);
        return shape;
    };
    /**
     * Creates a circle shape.
     * @param {number} radius The radius of the circle in world units.
     * @returns {Box2D.b2Shape}
     */
    Box2DManager.prototype.createCircleShape = function (radius) {
        var shape = new box2d_1.Box2D.b2CircleShape();
        shape.SetRadius(radius / this.B2_SCALE);
        return shape;
    };
    /**
     * Creates a definition that can be used to add fixtures to bodies.
     * @param {Box2D.b2Shape} shape
     * @param {number} density
     * @param {number} friction
     * @param {number} restitution
     * @returns {Box2D.b2FixtureDef}
     */
    Box2DManager.prototype.createFixtureDef = function (shape, density, friction, restitution) {
        var def = new box2d_1.Box2D.b2FixtureDef();
        def.shape = shape;
        def.density = density;
        def.friction = friction;
        def.restitution = restitution;
        return def;
    };
    /**
     * Creates a static body.
     * @param {Box2D.b2World} world
     * @param {number} x The starting x position of the body in world coordinates.
     * @param {number} y The starting y position of the body in world coordinates.
     * @param {Box2D.b2FixtureDef} fixtureDef (Optional) fixtureDef A fixture to add to the body.
     * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
     * @returns {Box2D.b2Body}
     */
    Box2DManager.prototype.createStaticBody = function (world, x, y, fixtureDef, bodyDef) {
        if (!bodyDef)
            bodyDef = this.staticBodyDef;
        return this.createBody(world, x, y, fixtureDef, bodyDef);
    };
    /**
     * Creates a dynamic body.
     * @param {Box2D.b2World} world
     * @param {number} x The starting x position of the body in world coordinates.
     * @param {number} y The starting y position of the body in world coordinates.
     * @param {Box2D.b2FixtureDef} fixtureDef (Optional) A fixture to add to the body.
     * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
     * @returns {Box2D.b2Body}
     */
    Box2DManager.prototype.createDynamicBody = function (world, x, y, fixtureDef, bodyDef) {
        if (!bodyDef)
            bodyDef = this.dynamicBodyDef;
        return this.createBody(world, x, y, fixtureDef, bodyDef);
    };
    /**
     * Creates a kinematic body.
     * @param {Box2D.b2World} world
     * @param {number} x The starting x position of the body in world coordinates.
     * @param {number} y The starting y position of the body in world coordinates.
     * @param {Box2D.b2FixtureDef} fixtureDef (Optional) A fixture to add to the body.
     * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
     * @returns {Box2D.b2Body}
     */
    Box2DManager.prototype.createKinematicBody = function (world, x, y, fixtureDef, bodyDef) {
        if (!bodyDef)
            bodyDef = this.kinematicBodyDef;
        return this.createBody(world, x, y, fixtureDef, bodyDef);
    };
    Box2DManager.prototype.createBody = function (world, x, y, fixtureDef, bodyDef) {
        this.tempVector2.x = x / this.B2_SCALE;
        this.tempVector2.y = y / this.B2_SCALE;
        bodyDef.position = this.tempVector2;
        var body = world.CreateBody(bodyDef);
        if (fixtureDef) {
            body.CreateFixture(fixtureDef);
        }
        return body;
    };
    /**
     * Returns the contact filter for the game.
     * @returns {Box2D.b2ContactFilter}
     */
    Box2DManager.prototype.getContactFilter = function (shouldCollide) {
        if (!this.contactFilter) {
            this.contactFilter = new b2ContactFilter(shouldCollide);
        }
        return this.contactFilter;
    };
    /**
     * If the specified object is involved in the contact, returns the other fixture involved.
     * @param {Box2D.b2Contact} contact
     * @param {PhysicsLinkedObject} linkedObject
     * @returns {Box2D.b2Fixture}
     */
    Box2DManager.getOtherObject = function (contact, linkedObject) {
        if (contact.GetFixtureA().GetBody() == linkedObject.body) {
            return contact.GetFixtureB();
        }
        else if (contact.GetFixtureB().GetBody() == linkedObject.body) {
            return contact.GetFixtureA();
        }
        else {
            return undefined;
        }
    };
    return Box2DManager;
}());
exports.Box2DManager = Box2DManager;
