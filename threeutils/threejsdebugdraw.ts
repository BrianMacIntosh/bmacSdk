
import THREE = require("three")
import "../typings";

import { Box2DManager } from "../b2utils";
import { Box2D } from "../thirdparty/box2d";

/**
 * An object that manages drawing debug shapes for bodies in a Box2D world.
 * @namespace
 */
export class ThreeJsDebugDraw extends THREE.Object3D
{
	// nested array, indexed by vert count
	private meshPools: { [s: string]: (THREE.Mesh|THREE.Line)[] } = {};
	private poolIndices: { [s: string]: number } = {};

	private drawFlags: number = 0;

	constructor(private manager: Box2DManager)
	{
		super();
	}

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
			this.add(mesh);
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

	private Box2DToThree(point : THREE.Vector3) : THREE.Vector3
	{
		point.applyMatrix4(this.manager.Box2DToGame);
		point.z = 0;
		return point;
	}

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

		geometry.vertices[0].set(vert1.x, vert1.y, 0);
		this.Box2DToThree(geometry.vertices[0]);
		geometry.vertices[1].set(vert2.x, vert2.y, 0);
		this.Box2DToThree(geometry.vertices[1]);

		geometry.verticesNeedUpdate = true;
		geometry.computeBoundingSphere();
	};

	public DrawPolygon(vertices: Box2D.b2Vec2[], vertexCount: number, color: Box2D.b2Color)
	{
		var geometry = this.getGeometry(color, vertexCount + 1);

		for (var i = 0; i < vertexCount; i++)
		{
			geometry.vertices[i].set(vertices[i].x, vertices[i].y, 0);
			this.Box2DToThree(geometry.vertices[i]);
		}

		// close by drawing the first vert again
		geometry.vertices[i].set(vertices[0].x, vertices[0].y, 0);
		this.Box2DToThree(geometry.vertices[i]);

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

		for (var i = 0; i < circleRes; i++)
		{
			var angle = i * Math.PI * 2 / circleRes;
			var x = Math.cos(angle) * radius + center.x;
			var y = Math.sin(angle) * radius + center.y;
			geometry.vertices[i].set(x, y, 0);
			this.Box2DToThree(geometry.vertices[i]);
		}

		// close by drawing the first vert again
		var x = Math.cos(0) * radius + center.x;
		var y = Math.sin(0) * radius + center.y;
		geometry.vertices[i].set(x, y, 0);
		this.Box2DToThree(geometry.vertices[i]);

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

	/**
	* Get the alpha value used for lines.
	* @return Alpha value used for drawing lines.
	**/
	public GetAlpha(): number
	{
		//TODO:
		return 1;
	}

	/**
	* Get the draw scale.
	* @return Draw scale ratio.
	**/
	public GetDrawScale(): number
	{
		//TODO:
		return 1;
	}

	/**
	* Get the alpha value used for fills.
	* @return Alpha value used for drawing fills.
	**/
	public GetFillAlpha(): number
	{
		//TODO:
		return 0;
	}

	/**
	* Get the line thickness.
	* @return Line thickness.
	**/
	public GetLineThickness(): number
	{
		//TODO:
		return 1;
	}

	/**
	* Get the HTML Canvas Element for drawing.
	* @note box2dflash uses Sprite object, box2dweb uses CanvasRenderingContext2D, that is why this function is called GetSprite().
	* @return The HTML Canvas Element used for debug drawing.
	**/
	public GetSprite(): CanvasRenderingContext2D
	{
		//TODO:
		return undefined;
	}

	/**
	* Get the scale used for drawing XForms.
	* @return Scale for drawing transforms.
	**/
	public GetXFormScale(): number
	{
		//TODO:
		return 1;
	}

	/**
	* Set the alpha value used for lines.
	* @param alpha Alpha value for drawing lines.
	**/
	public SetAlpha(alpha: number): void
	{
		//TODO:
	}

	/**
	* Set the draw scale.
	* @param drawScale Draw scale ratio.
	**/
	public SetDrawScale(drawScale: number): void
	{
		//TODO:
	}

	/**
	* Set the alpha value used for fills.
	* @param alpha Alpha value for drawing fills.
	**/
	public SetFillAlpha(alpha: number): void
	{
		//TODO:
	}

	/**
	* Set the line thickness.
	* @param lineThickness The new line thickness.
	**/
	public SetLineThickness(lineThickness: number): void
	{
		//TODO:
	}

	/**
	* Set the HTML Canvas Element for drawing.
	* @note box2dflash uses Sprite object, box2dweb uses CanvasRenderingContext2D, that is why this function is called SetSprite().
	* @param canvas HTML Canvas Element to draw debug information to.
	**/
	public SetSprite(canvas: CanvasRenderingContext2D): void
	{
		//TODO:
	}

	/**
	* Set the scale used for drawing XForms.
	* @param xformScale The transform scale.
	**/
	public SetXFormScale(xformScale: number): void
	{
		//TODO:
	}
}
