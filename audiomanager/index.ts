
export namespace AudioManager
{
	/**
	 * Set to false to disable audio.
	 * @type {boolean}
	 */
	export var enabled: boolean = true;
	
	/**
	 * Pooled audio sources, indexed by URL.
	 */
	var pool: { [s: string]: HTMLAudioElement[] } = {};

	/**
	 * The currently-playing music, if any.
	 */
	var currentMusic: HTMLAudioElement;

	/**
	 * The music currently being transitioned to, if any.
	 */
	var nextMusic: HTMLAudioElement;

	/**
	 * The volume the music is currently being lerped from.
	 */
	var musicLerpStartVolume: number;

	/**
	 * The volume the music is currently being lerped to.
	 */
	var musicLerpTargetVolume: number;

	/**
	 * The music transition timer.
	 */
	var musicLerpTimer: number;

	/**
	 * The duration of the current music transition.
	 */
	var musicLerpDuration: number;

	/**
	 * Set the position of the audio listener.
	 * @param {THREE.Vector3} position
	 */
	/*export function setListener(position: THREE.Vector3): void
	{
		listener = position;
	};*/

	export function _update(deltaSec: number): void
	{
		if (musicLerpDuration !== undefined)
		{
			musicLerpTimer += deltaSec;
			var lerpProgress = musicLerpTimer / musicLerpDuration;
			if (lerpProgress >= 1)
			{
				lerpProgress = 1;
				stop(currentMusic);
				if (nextMusic)
				{
					nextMusic.volume = 0;
					nextMusic.play();
					startMusicLerp(0.3, 1);
					currentMusic = nextMusic;
					nextMusic = undefined;
				}
				else
				{
					currentMusic = undefined;
				}
				musicLerpDuration = undefined;
			}
			if (currentMusic)
			{
				currentMusic.volume = (musicLerpTargetVolume - musicLerpStartVolume) * lerpProgress + musicLerpStartVolume;
			}
		}
	}

	//TODO: call this every frame
	/*function _updateVolume(clip: HTMLAudioElement): void
	{
		//Do ranges
		if (clip.position && listener)
		{
			var dist = clip.position.subtracted(listener).lengthSq();
			if (dist < audibleRange * audibleRange)
			{
				if (dist < dropoffRange * dropoffRange)
					clip.volume = 1;
				else
					clip.volume = 1 - (Math.sqrt(dist) - dropoffRange) / (audibleRange - dropoffRange);
			}
			else
				clip.volume = 0;
		}
		else
		{
			clip.volume = 1;
		}
	};*/

	/**
	 * Preload the specified clip(s) so there won't be a delay on play.
	 */
	export function preloadSound(url: string|string[]): void
	{
		// server-side fail silent
		if (typeof Audio === "undefined") return;
		
		if (!url)
		{
			//console.error("Tried to preload an empty string.");
		}
		else if (Array.isArray(url))
		{
			for (var c = 0; c < url.length; c++)
			{
				preloadSound(url[c]);
			}
		}
		else
		{
			if (!pool[url])
			{
				var clip = _allocateAudio(url);
				_addToPool(clip);
			}
		}
	};

	/**
	 * Starts playing a sound.
	 * @param {string} url URL of the sound to play.
	 * @param {number} vol Volume (0.0 - 1.0).
	 * @returns {Audio}
	 */
	export function playSound(urlParam: string|string[], vol: number): HTMLAudioElement
	{
		// server-side fail silent
		if (typeof Audio === "undefined") return null;
		
		if (urlParam === undefined) return null;
		if (!enabled) return null;
		
		var url: string;
		if (Array.isArray(urlParam))
		{
			url = urlParam[Math.floor(Math.random() * urlParam.length)];
		}
		else
		{
			url = urlParam;
		}
		
		var clip = _getAudioClip(url);
		clip.volume = vol || 1.0;
		clip.play();
		return clip;
	};

	/**
	 * Fades out the current music, and fades in the specified one.
	 */
	export function playMusic(url: string): HTMLAudioElement
	{
		// server-side fail silent
		if (typeof Audio === "undefined") return null;
		
		if (!enabled) return null;
		if (currentMusic && (currentMusic as any).relativeSrc == url) return currentMusic;

		nextMusic = _getAudioClip(url);
		nextMusic.loop = true;
		startMusicLerp(0.5, 0);
		return nextMusic;
	};

	export function startMusicLerp(durationSec: number, targetVolume: number): void
	{
		musicLerpStartVolume = currentMusic ? currentMusic.volume : 0;
		musicLerpTargetVolume = targetVolume;
		musicLerpTimer = 0;
		musicLerpDuration = durationSec;
	}

	function _getAudioClip(url: string): HTMLAudioElement
	{
		var clip: HTMLAudioElement;
		if (pool[url] && pool[url].length > 0)
		{
			//Use a pooled clip
			var last = pool[url].length-1;
			clip = pool[url][last];
			clip.currentTime = 0;
			clip.playbackRate = 1.0;
			pool[url].length = last;
		}
		else
		{
			//Make a new clip
			clip = _allocateAudio(url);
		}
		clip.volume = 1;
		clip.loop = false;
		return clip;
	};

	/**
 	 * Stops and pools the specified clip.
 	 * @param {Audio} clip
 	 */
 	export function stop(clip: HTMLAudioElement): void
 	{
		if (!clip) return;
 		clip.pause();
 		clip.currentTime = 0;
 		_addToPool(clip);
	};

	function _allocateAudio(url: string): HTMLAudioElement
	{
		if (!Audio) return undefined;
		var audio = new Audio(url);
		(audio as any).relativeSrc = url; //HACK:
		audio.addEventListener("ended", function() { _addToPool(audio); });
		return audio;
	}

	/**
	 * Returns the specified clip to the pool.
	 * @param {Audio} clip
	 */
	function _addToPool(clip: HTMLAudioElement): void
	{
		var url = (clip as any).relativeSrc; //HACK:
		if (!pool[url])
		{
			pool[url] = [];
		}
		if (!pool[url].contains(clip))
		{
			pool[url].push(clip);
		}
	};
}
