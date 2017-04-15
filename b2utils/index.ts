
/**
 * @fileOverview Contains utility functions for interacting with Box2D. 
 */

import { PhysicsLinkedObject } from "./PhysicsLinkedObject";
import { Box2D } from "../thirdparty/box2d";

export { PhysicsLinkedObject } from "./PhysicsLinkedObject";

export class b2ContactListener extends Box2D.b2ContactListener
{
	public BeginContact(contact: Box2D.b2Contact): void
	{
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		var objectA = fixtureA.GetBody().GetUserData();
		var objectB = fixtureB.GetBody().GetUserData();
		if (objectA) objectA.onBeginContact(contact, fixtureB);
		if (objectB) objectB.onBeginContact(contact, fixtureA);
	}

	public EndContact(contact: Box2D.b2Contact): void
	{
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		var objectA = fixtureA.GetBody().GetUserData();
		var objectB = fixtureB.GetBody().GetUserData();
		if (objectA) objectA.onEndContact(contact, fixtureB);
		if (objectB) objectB.onEndContact(contact, fixtureA);
	}

	public PreSolve(contact: Box2D.b2Contact, oldManifold: Box2D.b2Manifold): void
	{
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		var objectA = fixtureA.GetBody().GetUserData();
		var objectB = fixtureB.GetBody().GetUserData();
		if (objectA) objectA.onPreSolve(contact, oldManifold, fixtureB);
		if (objectB) objectB.onPreSolve(contact, oldManifold, fixtureA);
	}

	public PostSolve(contact: Box2D.b2Contact, impulse: Box2D.b2ContactImpulse): void
	{
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		var objectA = fixtureA.GetBody().GetUserData();
		var objectB = fixtureB.GetBody().GetUserData();
		if (objectA) objectA.onPostSolve(contact, impulse, fixtureB);
		if (objectB) objectB.onPostSolve(contact, impulse, fixtureA);
	}
}

export class b2ContactFilter extends Box2D.b2ContactFilter
{
	constructor (private shouldCollide: any) //TODO: predicate
	{
		super();
	}

	public ShouldCollide(fixtureA: Box2D.b2Fixture, fixtureB: Box2D.b2Fixture): boolean
	{
		return this.shouldCollide(fixtureA, fixtureB);
	}
}

export class Box2DManager
{
	//TODO: replace with matrices below
	public B2_SCALE: number = 50

	public Box2DToGame: THREE.Matrix4 = new THREE.Matrix4();
	public GameToBox2D: THREE.Matrix4 = new THREE.Matrix4();

	/**
	 * List of all PhysicsLinkedObject that exist.
	 * @type {PhysicsLinkedObject[]}
	 */
	public AllObjects: PhysicsLinkedObject[] = []

	/**
	 * Temporary vector used for math, to prevent garbage allocation. Use only VERY locally.
	 * @type {Box2D.b2Vec2}
	 */
	public tempVector2: Box2D.b2Vec2 = new Box2D.b2Vec2();

	public filter_all = new Box2D.b2FilterData();
	public filter_none = new Box2D.b2FilterData();

	public staticBodyDef = new Box2D.b2BodyDef();
	public dynamicBodyDef = new Box2D.b2BodyDef();
	public kinematicBodyDef = new Box2D.b2BodyDef();

	private contactFilter: Box2D.b2ContactFilter;
	private contactListener: Box2D.b2ContactListener;

	constructor()
	{
		this.filter_all.maskBits = 0xFFFF;
		this.filter_all.categoryBits = 0xFFFF;

		this.filter_none.maskBits = 0;
		this.filter_none.categoryBits = 0;

		this.dynamicBodyDef.type = Box2D.b2Body.b2_dynamicBody;
		this.kinematicBodyDef.type = Box2D.b2Body.b2_kinematicBody;
	}

	/**
	 * Creates an edge shape.
	 * @param {number} x1 First x coordinate in world units.
	 * @param {number} y1 First y coordinate in world units.
	 * @param {number} x2 Second x coordinate in world units.
	 * @param {number} y2 Second y coordinate in world units.
	 * @returns {Box2D.b2Shape}
	 */
	public createEdgeShape(x1: number, y1: number, x2: number, y2: number): Box2D.b2PolygonShape
	{
		var shape = new Box2D.b2PolygonShape();
		shape.SetAsEdge(
			new Box2D.b2Vec2(x1/this.B2_SCALE, y1/this.B2_SCALE),
			new Box2D.b2Vec2(x2/this.B2_SCALE, y2/this.B2_SCALE));
		return shape;
	}

	/**
	 * Creates a rectangle shape.
	 * @param {number} w The width of the rectangle in world units.
	 * @param {number} h The height of the rectangle in world units.
	 * @returns {Box2D.b2Shape}
	 */
	public createRectShape(w: number, h: number): Box2D.b2PolygonShape
	{
		var shape = new Box2D.b2PolygonShape();
		shape.SetAsBox(0.5 * w/this.B2_SCALE, 0.5 * h/this.B2_SCALE);
		return shape;
	}

	/**
	 * Creates a circle shape.
	 * @param {number} radius The radius of the circle in world units.
	 * @returns {Box2D.b2Shape}
	 */
	public createCircleShape(radius: number) : Box2D.b2CircleShape
	{
		var shape = new Box2D.b2CircleShape();
		shape.SetRadius(radius/this.B2_SCALE);
		return shape;
	}

	/**
	 * Creates a definition that can be used to add fixtures to bodies.
	 * @param {Box2D.b2Shape} shape
	 * @param {number} density
	 * @param {number} friction
	 * @param {number} restitution
	 * @returns {Box2D.b2FixtureDef}
	 */
	public createFixtureDef(shape: Box2D.b2Shape, density: number, friction: number, restitution: number): Box2D.b2FixtureDef
	{
		var def = new Box2D.b2FixtureDef();
		def.shape = shape;
		def.density = density;
		def.friction = friction;
		def.restitution = restitution;
		return def;
	}

	/**
	 * Creates a static body.
	 * @param {Box2D.b2World} world
	 * @param {number} x The starting x position of the body in world coordinates.
	 * @param {number} y The starting y position of the body in world coordinates.
	 * @param {Box2D.b2FixtureDef} fixtureDef (Optional) fixtureDef A fixture to add to the body.
	 * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
	 * @returns {Box2D.b2Body}
	 */
	public createStaticBody(world: Box2D.b2World, x: number, y: number,
		fixtureDef?: Box2D.b2FixtureDef, bodyDef?: Box2D.b2BodyDef): Box2D.b2Body
	{
		if (!bodyDef) bodyDef = this.staticBodyDef;
		return this.createBody(world, x, y, fixtureDef, bodyDef);
	}

	/**
	 * Creates a dynamic body.
	 * @param {Box2D.b2World} world
	 * @param {number} x The starting x position of the body in world coordinates.
	 * @param {number} y The starting y position of the body in world coordinates.
	 * @param {Box2D.b2FixtureDef} fixtureDef (Optional) A fixture to add to the body.
	 * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
	 * @returns {Box2D.b2Body}
	 */
	public createDynamicBody(world: Box2D.b2World, x: number, y: number,
		fixtureDef?: Box2D.b2FixtureDef, bodyDef?: Box2D.b2BodyDef): Box2D.b2Body
	{
		if (!bodyDef) bodyDef = this.dynamicBodyDef;
		return this.createBody(world, x, y, fixtureDef, bodyDef);
	}

	/**
	 * Creates a kinematic body.
	 * @param {Box2D.b2World} world
	 * @param {number} x The starting x position of the body in world coordinates.
	 * @param {number} y The starting y position of the body in world coordinates.
	 * @param {Box2D.b2FixtureDef} fixtureDef (Optional) A fixture to add to the body.
	 * @param {Box2D.b2BodyDef} bodyDef (Optional) definition to use for the body
	 * @returns {Box2D.b2Body}
	 */
	public createKinematicBody(world: Box2D.b2World, x: number, y: number,
		fixtureDef?: Box2D.b2FixtureDef, bodyDef?: Box2D.b2BodyDef): Box2D.b2Body
	{
		if (!bodyDef) bodyDef = this.kinematicBodyDef;
		return this.createBody(world, x, y, fixtureDef, bodyDef);
	}

	private createBody(world: Box2D.b2World, x: number, y: number,
		fixtureDef?: Box2D.b2FixtureDef, bodyDef?: Box2D.b2BodyDef): Box2D.b2Body
	{
		this.tempVector2.x = x / this.B2_SCALE;
		this.tempVector2.y = y / this.B2_SCALE;
		bodyDef.position = this.tempVector2;
		var body = world.CreateBody(bodyDef);
		if (fixtureDef)
		{
			body.CreateFixture(fixtureDef);
		}
		return body;
	}

	/**
	 * Returns the contact filter for the game.
	 * @returns {Box2D.b2ContactFilter}
	 */
	public getContactFilter(shouldCollide): Box2D.b2ContactFilter
	{
		if (!this.contactFilter)
		{
			this.contactFilter = new b2ContactFilter(shouldCollide);
		}
		return this.contactFilter;
	}

	/**
	 * If the specified object is involved in the contact, returns the other fixture involved.
	 * @param {Box2D.b2Contact} contact
	 * @param {PhysicsLinkedObject} linkedObject
	 * @returns {Box2D.b2Fixture}
	 */
	public static getOtherObject(contact: Box2D.b2Contact, linkedObject: PhysicsLinkedObject): Box2D.b2Fixture
	{
		if (contact.GetFixtureA().GetBody() == linkedObject.body)
		{
			return contact.GetFixtureB();
		}
		else if (contact.GetFixtureB().GetBody() == linkedObject.body)
		{
			return contact.GetFixtureA();
		}
		else
		{
			return undefined;
		}
	}
}
