
import "../typings";

import { b2Utils } from "../b2utils";
import { Box2D } from "../thirdparty/box2d";

/**
 * An object that manages drawing debug shapes for bodies in a Box2D world.
 * @namespace
 */
export class ThreeJsDebugDraw
{
	// nested array, indexed by vert count
	private meshPools: { [s: string]: (THREE.Mesh|THREE.Line)[] } = {};
	private poolIndices: { [s: string]: number } = {};

	private drawFlags: number = 0;

	public transform: THREE.Object3D = new THREE.Object3D();

	private getGeometry(color: Box2D.b2Color, vertCount: number): THREE.Geometry
	{
		if (!this.meshPools[vertCount])
		{
			this.meshPools[vertCount] = [];
			this.poolIndices[vertCount] = 0;
		}

		var pool = this.meshPools[vertCount];

		var mesh: THREE.Mesh|THREE.Line;
		var geometry: THREE.Geometry;

		var index = this.poolIndices[vertCount]++;
		if (!pool[index])
		{
			geometry = new THREE.Geometry();
			for (var i = 0; i < vertCount; i++)
			{
				geometry.vertices.push(new THREE.Vector3());
			}

			var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
			mesh = new THREE.Line(geometry, lineMaterial);

			pool[index] = mesh;
			this.transform.add(mesh);
		}
		else
		{
			mesh = pool[index];

			var material = pool[index].material;
			(material as THREE.LineBasicMaterial).color.setHex(color.color);

			geometry = pool[index].geometry as THREE.Geometry;
		}

		mesh.visible = true;

		return geometry;
	};

	public startDrawing(): void
	{
		// reset mesh counters
		for (var i in this.meshPools)
		{
			this.poolIndices[i] = 0;
		}
	};

	public finishDrawing(): void
	{
		// hide excess meshPools
		for (var i in this.meshPools)
		{
			for (; this.poolIndices[i] < this.meshPools[i].length; this.poolIndices[i]++)
			{
				this.meshPools[i][this.poolIndices[i]].visible = false;
			}
		}
	};

	public SetFlags(flags: number): void
	{
		if (flags === undefined) flags = 0;
		this.drawFlags = flags;
	};

	public GetFlags(): number
	{
		return this.drawFlags;
	};

	public AppendFlags(flags: number): void
	{
		if (flags === undefined) flags = 0;
		this.drawFlags |= flags;
	};

	public ClearFlags(flags: number): void
	{
		if (flags === undefined) flags = 0;
		this.drawFlags &= ~flags;
	};

	public DrawSegment(vert1: Box2D.b2Vec2, vert2: Box2D.b2Vec2, color: Box2D.b2Color)
	{
		var geometry = this.getGeometry(color, 2);

		var x1 = vert1.x * b2Utils.B2_SCALE;
		var y1 = vert1.y * b2Utils.B2_SCALE;
		var x2 = vert2.x * b2Utils.B2_SCALE;
		var y2 = vert2.y * b2Utils.B2_SCALE;

		geometry.vertices[0].set(x1, y1, 0);
		geometry.vertices[1].set(x2, y2, 0);

		geometry.verticesNeedUpdate = true;
		geometry.computeBoundingSphere();
	};

	public DrawPolygon(vertices: Box2D.b2Vec2[], vertexCount: number, color: Box2D.b2Color)
	{
		var geometry = this.getGeometry(color, vertexCount + 1);

		for (var i = 0; i < vertexCount; i++)
		{
			var x = vertices[i].x * b2Utils.B2_SCALE;
			var y = vertices[i].y * b2Utils.B2_SCALE;
			geometry.vertices[i].set(x, y, 0);
		}

		// close by drawing the first vert again
		var x = vertices[0].x * b2Utils.B2_SCALE;
		var y = vertices[0].y * b2Utils.B2_SCALE;
		geometry.vertices[i].set(x, y, 0);

		geometry.verticesNeedUpdate = true;
		geometry.computeBoundingSphere();
	};

	public DrawSolidPolygon(vertices: Box2D.b2Vec2[], vertexCount: number, color: Box2D.b2Color)
	{
		//TODO:
		this.DrawPolygon(vertices, vertexCount, color);
	};

	public DrawCircle(center: Box2D.b2Vec2, radius: number, color: Box2D.b2Color)
	{
		var circleRes = 16;
		var geometry = this.getGeometry(color, circleRes + 1);

		var cx = center.x * b2Utils.B2_SCALE;
		var cy = center.y * b2Utils.B2_SCALE;

		for (var i = 0; i < circleRes; i++)
		{
			var angle = i * Math.PI * 2 / circleRes;
			var x = Math.cos(angle) * radius * b2Utils.B2_SCALE + cx;
			var y = Math.sin(angle) * radius * b2Utils.B2_SCALE + cy;
			geometry.vertices[i].set(x, y, 0);
		}

		// close by drawing the first vert again
		var x = Math.cos(0) * radius * b2Utils.B2_SCALE + cx;
		var y = Math.sin(0) * radius * b2Utils.B2_SCALE + cy;
		geometry.vertices[i].set(x, y, 0);

		geometry.verticesNeedUpdate = true;
		geometry.computeBoundingSphere();
	};

	public DrawSolidCircle(center, radius, axis, color)
	{
		//TODO:
		this.DrawCircle(center, radius, color);
	};

	public DrawTransform(transform)
	{
		//TODO:
	};
}
