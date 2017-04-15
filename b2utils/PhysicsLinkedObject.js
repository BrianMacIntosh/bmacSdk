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
var THREE = require("three");
require("../typings");
var _1 = require("../");
var box2d_1 = require("../thirdparty/box2d");
/**
 * Base class for an object that has three.js visuals and a Box2D body.
 */
var PhysicsLinkedObject = (function (_super) {
    __extends(PhysicsLinkedObject, _super);
    function PhysicsLinkedObject(manager, body) {
        var _this = _super.call(this) || this;
        _this.manager = manager;
        _this.manager.AllObjects.push(_this);
        if (body) {
            _this.linkBody(body);
        }
        return _this;
    }
    PhysicsLinkedObject.prototype.linkBody = function (body) {
        this.body = body;
        this.body.SetUserData(this);
        this.syncTransformToBody(true);
    };
    /**
     * Undestroys a soft-destroyed object (for pooling).
     */
    PhysicsLinkedObject.prototype.undestroy = function () {
        this.manager.AllObjects.push(this);
        if (this.body) {
            this.body.SetActive(true);
        }
    };
    /**
     * Destroys this object.
     * @param {boolean} soft If set, does not actually destroy memory (for pooling).
     */
    PhysicsLinkedObject.prototype.destroy = function (soft) {
        if (this.parent) {
            this.parent.remove(this);
        }
        var index = this.manager.AllObjects.indexOf(this);
        if (index >= 0) {
            this.manager.AllObjects.splice(index, 1);
        }
        if (soft)
            this.body.SetActive(false);
        else
            this.destroyBody();
    };
    /**
     * Destroys the body associated with this object.
     */
    PhysicsLinkedObject.prototype.destroyBody = function () {
        if (this.body) {
            this.body.GetWorld().DestroyBody(this.body);
            this.body.SetUserData(undefined);
            this.body = undefined;
        }
    };
    /**
     * Updates this object once per frame.
     */
    PhysicsLinkedObject.prototype.update = function (deltaSec) {
        this.syncTransformToBody(false);
    };
    /**
     * Moves the object to match the body position.
     */
    PhysicsLinkedObject.prototype.syncTransformToBody = function (force) {
        if (this.body
            && (force || (this.body.IsAwake() && this.body.GetType() != box2d_1.Box2D.b2Body.b2_staticBody))) {
            var z = this.position.z;
            var physicsPos = this.body.GetPosition();
            this.position.set(physicsPos.x, physicsPos.y, 0);
            this.position.applyMatrix4(this.manager.Box2DToGame);
            this.rotation.z = this.body.GetAngle(); //TODO: matrix
            this.position.z = z;
            //this.updateMatrix();
        }
    };
    /**
     * Moves the body position to match the object.
     */
    PhysicsLinkedObject.prototype.syncBodyToTransform = function () {
        if (this.body) {
            _1.ThreeUtils.tempVector3.copy(this.position);
            _1.ThreeUtils.tempVector3.z = 0;
            _1.ThreeUtils.tempVector3.applyMatrix4(this.manager.GameToBox2D);
            this.manager.tempVector2.x = _1.ThreeUtils.tempVector3.x;
            this.manager.tempVector2.y = _1.ThreeUtils.tempVector3.y;
            this.body.SetPositionAndAngle(this.manager.tempVector2, this.rotation.z); //TODO: matrix rotation
        }
    };
    /**
     * Moves the body to the specified position.
     */
    PhysicsLinkedObject.prototype.setPosition = function (position) {
        if (this.body)
            this.body.SetPosition(position);
        this.syncTransformToBody(true);
    };
    /**
     * Applies the specified impulse to the center of the body, but does not allow it to
     * increase the velocity above 'maxSpeed'. If the velocity is already above that, it can stay there.
     * @param {Box2D.b2Vec2} impulse
     * @param {Number} maxSpeed
     */
    PhysicsLinkedObject.prototype.applyLinearImpulseWithVelocityCap = function (impulse, maxSpeed) {
        if (impulse.x == 0 && impulse.y == 0)
            return;
        var velocity = this.body.GetLinearVelocity();
        var velocityLength = velocity.Length();
        if (this.body.GetType() == box2d_1.Box2D.b2Body.b2_kinematicBody) {
            velocity.x += impulse.x;
            velocity.y += impulse.y;
            this.body.SetLinearVelocity(velocity);
        }
        else {
            this.body.ApplyImpulse(impulse, this.body.GetPosition());
        }
        this.limitSpeed(Math.max(maxSpeed, velocityLength));
    };
    /**
     * Reduces the object's velocity to be no greater than the specified speed.
     * @param {Number} maxSpeed
     */
    PhysicsLinkedObject.prototype.limitSpeed = function (maxSpeed) {
        var postVelocity = this.body.GetLinearVelocity();
        var postVelocityLength = postVelocity.Length();
        if (postVelocityLength > maxSpeed) {
            postVelocity.x = maxSpeed * postVelocity.x / postVelocityLength;
            postVelocity.y = maxSpeed * postVelocity.y / postVelocityLength;
            this.body.SetLinearVelocity(postVelocity);
        }
    };
    /**
     * Called by box2d when this object starts touching another.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onBeginContact = function (contact, otherFixture) {
    };
    /**
     * Called by box2d when this object stops touching another.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onEndContact = function (contact, otherFixture) {
    };
    /**
     * Called by box2d each frame this body is touching another body, before the response is calculated.
     * The response can be disabled here.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Manifold} oldManifold
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onPreSolve = function (contact, oldManifold, otherFixture) {
    };
    /**
     * Called by box2d each frame this body is touching another body, after the response is calculated.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Impulse} impulse
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onPostSolve = function (contact, impulse, otherFixture) {
    };
    return PhysicsLinkedObject;
}(THREE.Object3D));
exports.PhysicsLinkedObject = PhysicsLinkedObject;
;
