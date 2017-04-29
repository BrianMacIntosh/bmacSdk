
import THREE = require("three")
import "../typings";

import { Box2DManager } from "./";
import { Box2D } from "../thirdparty/box2d";

/**
 * Base class for an object that has three.js visuals and a Box2D body.
 */
export class PhysicsLinkedObject extends THREE.Object3D
{
	public body: Box2D.b2Body;

	private static tempVector3: THREE.Vector3 = new THREE.Vector3();

	constructor(
		protected physicsManager: Box2DManager,
		body?: Box2D.b2Body)
	{
		super();

		this.physicsManager.AllObjects.push(this);
		
		if (body)
		{
			this.linkBody(body);
		}
	}

	protected linkBody(body : Box2D.b2Body)
	{
		this.body = body;
		this.body.SetUserData(this);
		this.syncTransformToBody(true);
	}

	/**
	 * Undestroys a soft-destroyed object (for pooling).
	 */
	public undestroy(): void
	{
		this.physicsManager.AllObjects.push(this);
		if (this.body)
		{
			this.body.SetActive(true);
		}
	}

	/**
	 * Destroys this object.
	 * @param {boolean} soft If set, does not actually destroy memory (for pooling).
	 */
	public destroy(soft? : boolean): void
	{
		if (this.parent)
		{
			this.parent.remove(this);
		}

		var index = this.physicsManager.AllObjects.indexOf(this);
		if (index >= 0)
		{
			this.physicsManager.AllObjects.splice(index, 1);
		}

		if (soft) this.body.SetActive(false);
		else this.destroyBody();
	}

	/**
	 * Destroys the body associated with this object.
	 */
	public destroyBody(): void
	{
		if (this.body)
		{
			this.body.GetWorld().DestroyBody(this.body);
			this.body.SetUserData(undefined);
			this.body = undefined;
		}
	}

	/**
	 * Updates this object once per frame.
	 */
	public update(deltaSec: number): void
	{
		this.syncTransformToBody(false);
	}

	/**
	 * Moves the object to match the body position.
	 */
	public syncTransformToBody(force): void
	{
		//TODO: check that body has actually moved?
		if (this.body && (force || this.body.IsAwake()))
		{
			var z = this.position.z;
			var physicsPos = this.body.GetPosition();
			this.position.set(physicsPos.x, physicsPos.y, 0);
			this.position.applyMatrix4(this.physicsManager.Box2DToGame);
			this.rotation.z = this.body.GetAngle(); //TODO: matrix
			this.position.z = z;
			//this.updateMatrix();
		}
	}

	/**
	 * Moves the body position to match the object.
	 */
	public syncBodyToTransform(): void
	{
		if (this.body)
		{
			PhysicsLinkedObject.tempVector3.copy(this.position);
			PhysicsLinkedObject.tempVector3.z = 0;
			PhysicsLinkedObject.tempVector3.applyMatrix4(this.physicsManager.GameToBox2D);
			this.physicsManager.tempVector2.x = PhysicsLinkedObject.tempVector3.x;
			this.physicsManager.tempVector2.y = PhysicsLinkedObject.tempVector3.y;
			this.body.SetPositionAndAngle(this.physicsManager.tempVector2, this.rotation.z); //TODO: matrix rotation
		}
	}

	/**
	 * Moves the body to the specified position.
	 */
	public setPosition(position: Box2D.b2Vec2): void
	{
		if (this.body) this.body.SetPosition(position);
		this.syncTransformToBody(true);
	}

	/**
	 * Applies the specified impulse to the center of the body.
	 * @param {Box2D.b2Vec2} impulse
	 */
	public applyLinearImpulse(impulse: Box2D.b2Vec2): void
	{
		if (impulse.x == 0 && impulse.y == 0) return;
		
		var velocity = this.body.GetLinearVelocity();
		if (this.body.GetType() == Box2D.b2Body.b2_kinematicBody)
		{
			velocity.x += impulse.x;
			velocity.y += impulse.y;
			this.body.SetLinearVelocity(velocity);
		}
		else
		{
			this.body.ApplyImpulse(impulse, this.body.GetPosition());
		}
	}

	/**
	 * Applies the specified impulse to the center of the body, but does not allow it to
	 * increase the velocity above 'maxSpeed'. If the velocity is already above that, it can stay there.
	 * @param {Box2D.b2Vec2} impulse
	 * @param {Number} maxSpeed
	 */
	public applyLinearImpulseWithVelocityCap(impulse: Box2D.b2Vec2, maxSpeed: number): void
	{
		var velocity = this.body.GetLinearVelocity();
		var velocityLength = velocity.Length();
		this.applyLinearImpulse(impulse);
		this.limitSpeed(Math.max(maxSpeed, velocityLength));
	}

	/**
	 * Reduces the object's velocity to be no greater than the specified speed.
	 * @param {Number} maxSpeed
	 */
	public limitSpeed(maxSpeed: number): void
	{
		var postVelocity = this.body.GetLinearVelocity();
		var postVelocityLength = postVelocity.Length();
		if (postVelocityLength > maxSpeed)
		{
			postVelocity.x = maxSpeed * postVelocity.x / postVelocityLength;
			postVelocity.y = maxSpeed * postVelocity.y / postVelocityLength;
			this.body.SetLinearVelocity(postVelocity);
		}
	}

	/**
	 * Called by box2d when this object starts touching another.
	 * You cannot create or destroy bodies in here.
	 * @param {Box2D.b2Contact} contact
	 * @param {Box2D.b2Fixture} otherFixture
	 */
	public onBeginContact(contact: Box2D.b2Contact, otherFixture: Box2D.b2Fixture): void
	{

	}

	/**
	 * Called by box2d when this object stops touching another.
	 * You cannot create or destroy bodies in here.
	 * @param {Box2D.b2Contact} contact
	 * @param {Box2D.b2Fixture} otherFixture
	 */
	public onEndContact(contact: Box2D.b2Contact, otherFixture: Box2D.b2Fixture): void
	{

	}

	/**
	 * Called by box2d each frame this body is touching another body, before the response is calculated.
	 * The response can be disabled here.
	 * You cannot create or destroy bodies in here.
	 * @param {Box2D.b2Contact} contact
	 * @param {Box2D.b2Manifold} oldManifold
	 * @param {Box2D.b2Fixture} otherFixture
	 */
	public onPreSolve(contact: Box2D.b2Contact, oldManifold: Box2D.b2Manifold, otherFixture: Box2D.b2Fixture): void
	{

	}

	/**
	 * Called by box2d each frame this body is touching another body, after the response is calculated.
	 * You cannot create or destroy bodies in here.
	 * @param {Box2D.b2Contact} contact
	 * @param {Box2D.b2Impulse} impulse
	 * @param {Box2D.b2Fixture} otherFixture
	 */
	public onPostSolve(contact: Box2D.b2Contact, impulse: Box2D.b2ContactImpulse, otherFixture: Box2D.b2Fixture): void
	{

	}
};
