import {EventEmitter} from "hap";
import {CasparCGSocket, SocketState} from "./lib/CasparCGSocket";
import {AMCP} from "./lib/AMCP";
import {Enum} from "./lib/ServerStateEnum";
import {IConnectionOptions, ConnectionOptions} from "./lib/AMCPConnectionOptions";
// Command NS
import {Command as CommandNS} from "./lib/AbstractCommand";
import IAMCPCommand = CommandNS.IAMCPCommand;
import isIAMCPCommand = CommandNS.isIAMCPCommand;
import IAMCPStatus = CommandNS.IAMCPStatus;
// Param NS
import {Param as ParamNS} from "./lib/ParamSignature";
import Param = ParamNS.Param;
import TemplateData = ParamNS.TemplateData;
// Event NS
import {BaseEvent, CasparCGSocketStausEvent, CasparCGSocketCommandEvent, LogEvent} from "./lib/event/Events";
// Callback NS
import {Callback as CallbackNS} from "./lib/global/Callback";
import IBooleanCallback = CallbackNS.IBooleanCallback;
import IErrorCallback = CallbackNS.IErrorCallback;
import IEventCallback = CallbackNS.IEventCallback;
import IStringCallback = CallbackNS.IStringCallback;
import IResponseCallback = CallbackNS.IResponseCallback;
import ISocketStatusCallback = CallbackNS.ISocketStatusCallback;

/*
https://github.com/CasparCG/Server/commits/2.1.0/protocol/amcp/AMCPCommandsImpl.cpp
repo.register_channel_command(	L"Basic Commands",		L"LOADBG",						loadbg_describer,					loadbg_command,					1);
repo.register_channel_command(	L"Basic Commands",		L"LOAD",						load_describer,						load_command,					1);
repo.register_channel_command(	L"Basic Commands",		L"PLAY",						play_describer,						play_command,					0);
repo.register_channel_command(	L"Basic Commands",		L"PAUSE",						pause_describer,					pause_command,					0);
repo.register_channel_command(	L"Basic Commands",		L"RESUME",						resume_describer,					resume_command,					0);
repo.register_channel_command(	L"Basic Commands",		L"STOP",						stop_describer,						stop_command,					0);
repo.register_channel_command(	L"Basic Commands",		L"CLEAR",						clear_describer,					clear_command,					0);
repo.register_channel_command(	L"Basic Commands",		L"CALL",						call_describer,						call_command,					1);
repo.register_channel_command(	L"Basic Commands",		L"SWAP",						swap_describer,						swap_command,					1);
repo.register_channel_command(	L"Basic Commands",		L"ADD",							add_describer,						add_command,					1);
repo.register_channel_command(	L"Basic Commands",		L"REMOVE",						remove_describer,					remove_command,					0);
repo.register_channel_command(	L"Basic Commands",		L"PRINT",						print_describer,					print_command,					0);
repo.register_command(			L"Basic Commands",		L"LOG LEVEL",					log_level_describer,				log_level_command,				1);
repo.register_command(			L"Basic Commands",		L"LOG CATEGORY",				log_category_describer,				log_category_command,			2);
repo.register_channel_command(	L"Basic Commands",		L"SET",							set_describer,						set_command,					2);
repo.register_command(			L"Basic Commands",		L"LOCK",						lock_describer,						lock_command,					2);

repo.register_command(			L"Data Commands", 		L"DATA STORE",					data_store_describer,				data_store_command,				2);
repo.register_command(			L"Data Commands", 		L"DATA RETRIEVE",				data_retrieve_describer,			data_retrieve_command,			1);
repo.register_command(			L"Data Commands", 		L"DATA LIST",					data_list_describer,				data_list_command,				0);
repo.register_command(			L"Data Commands", 		L"DATA REMOVE",					data_remove_describer,				data_remove_command,			1);

repo.register_channel_command(	L"Template Commands",	L"CG ADD",						cg_add_describer,					cg_add_command,					3);
repo.register_channel_command(	L"Template Commands",	L"CG PLAY",						cg_play_describer,					cg_play_command,				1);
repo.register_channel_command(	L"Template Commands",	L"CG STOP",						cg_stop_describer,					cg_stop_command,				1);
repo.register_channel_command(	L"Template Commands",	L"CG NEXT",						cg_next_describer,					cg_next_command,				1);
repo.register_channel_command(	L"Template Commands",	L"CG REMOVE",					cg_remove_describer,				cg_remove_command,				1);
repo.register_channel_command(	L"Template Commands",	L"CG CLEAR",					cg_clear_describer,					cg_clear_command,				0);
repo.register_channel_command(	L"Template Commands",	L"CG UPDATE",					cg_update_describer,				cg_update_command,				2);
repo.register_channel_command(	L"Template Commands",	L"CG INVOKE",					cg_invoke_describer,				cg_invoke_command,				2);
repo.register_channel_command(	L"Template Commands",	L"CG INFO",						cg_info_describer,					cg_info_command,				0);

repo.register_channel_command(	L"Mixer Commands",		L"MIXER KEYER",					mixer_keyer_describer,				mixer_keyer_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER CHROMA",				mixer_chroma_describer,				mixer_chroma_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER BLEND",					mixer_blend_describer,				mixer_blend_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER OPACITY",				mixer_opacity_describer,			mixer_opacity_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER BRIGHTNESS",			mixer_brightness_describer,			mixer_brightness_command,		0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER SATURATION",			mixer_saturation_describer,			mixer_saturation_command,		0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER CONTRAST",				mixer_contrast_describer,			mixer_contrast_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER LEVELS",				mixer_levels_describer,				mixer_levels_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER FILL",					mixer_fill_describer,				mixer_fill_command,				0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER CLIP",					mixer_clip_describer,				mixer_clip_command,				0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER ANCHOR",				mixer_anchor_describer,				mixer_anchor_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER CROP",					mixer_crop_describer,				mixer_crop_command,				0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER ROTATION",				mixer_rotation_describer,			mixer_rotation_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER PERSPECTIVE",			mixer_perspective_describer,		mixer_perspective_command,		0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER MIPMAP",				mixer_mipmap_describer,				mixer_mipmap_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER VOLUME",				mixer_volume_describer,				mixer_volume_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER MASTERVOLUME",			mixer_mastervolume_describer,		mixer_mastervolume_command,		0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER STRAIGHT_ALPHA_OUTPUT",	mixer_straight_alpha_describer,		mixer_straight_alpha_command,	0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER GRID",					mixer_grid_describer,				mixer_grid_command,				1);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER COMMIT",				mixer_commit_describer,				mixer_commit_command,			0);
repo.register_channel_command(	L"Mixer Commands",		L"MIXER CLEAR",					mixer_clear_describer,				mixer_clear_command,			0);
repo.register_command(			L"Mixer Commands",		L"CHANNEL_GRID",				channel_grid_describer,				channel_grid_command,			0);

repo.register_command(			L"Thumbnail Commands",	L"THUMBNAIL LIST",				thumbnail_list_describer,			thumbnail_list_command,			0);
repo.register_command(			L"Thumbnail Commands",	L"THUMBNAIL RETRIEVE",			thumbnail_retrieve_describer,		thumbnail_retrieve_command,		1);
repo.register_command(			L"Thumbnail Commands",	L"THUMBNAIL GENERATE",			thumbnail_generate_describer,		thumbnail_generate_command,		1);
repo.register_command(			L"Thumbnail Commands",	L"THUMBNAIL GENERATE_ALL",		thumbnail_generateall_describer,	thumbnail_generateall_command,	0);

repo.register_command(			L"Query Commands",		L"CINF",						cinf_describer,						cinf_command,					1);
repo.register_command(			L"Query Commands",		L"CLS",							cls_describer,						cls_command,					0);
repo.register_command(			L"Query Commands",		L"FLS",							fls_describer,						fls_command,					0);
repo.register_command(			L"Query Commands",		L"TLS",							tls_describer,						tls_command,					0);
repo.register_command(			L"Query Commands",		L"VERSION",						version_describer,					version_command,				0);
repo.register_command(			L"Query Commands",		L"INFO",						info_describer,						info_command,					0);
repo.register_channel_command(	L"Query Commands",		L"INFO",						info_channel_describer,				info_channel_command,			0);
repo.register_command(			L"Query Commands",		L"INFO TEMPLATE",				info_template_describer,			info_template_command,			1);
repo.register_command(			L"Query Commands",		L"INFO CONFIG",					info_config_describer,				info_config_command,			0);
repo.register_command(			L"Query Commands",		L"INFO PATHS",					info_paths_describer,				info_paths_command,				0);
repo.register_command(			L"Query Commands",		L"INFO SYSTEM",					info_system_describer,				info_system_command,			0);
repo.register_command(			L"Query Commands",		L"INFO SERVER",					info_server_describer,				info_server_command,			0);
repo.register_command(			L"Query Commands",		L"INFO QUEUES",					info_queues_describer,				info_queues_command,			0);
repo.register_command(			L"Query Commands",		L"INFO THREADS",				info_threads_describer,				info_threads_command,			0);
repo.register_channel_command(	L"Query Commands",		L"INFO DELAY",					info_delay_describer,				info_delay_command,				0);
repo.register_command(			L"Query Commands",		L"DIAG",						diag_describer,						diag_command,					0);
repo.register_command(			L"Query Commands",		L"GL INFO",						gl_info_describer,					gl_info_command,				0);
repo.register_command(			L"Query Commands",		L"GL GC",						gl_gc_describer,					gl_gc_command,					0);
repo.register_command(			L"Query Commands",		L"BYE",							bye_describer,						bye_command,					0);
repo.register_command(			L"Query Commands",		L"KILL",						kill_describer,						kill_command,					0);
repo.register_command(			L"Query Commands",		L"RESTART",						restart_describer,					restart_command,				0);
repo.register_command(			L"Query Commands",		L"HELP",						help_describer,						help_command,					0);
repo.register_command(			L"Query Commands",		L"HELP PRODUCER",				help_producer_describer,			help_producer_command,			0);
repo.register_command(			L"Query Commands",		L"HELP CONSUMER",				help_consumer_describer,			help_consumer_command,			0);
*/

/**
 * CasparCG Protocols
 */
export namespace CasparCGProtocols {

	/**
	 * CasparCG Protocol version 2.1
	 */
	export namespace v2_1 {

		/**
		 * AMCP version 2.1
		 */
		export interface AMCP extends IVideo, ICG, IMixer, IChannel, IData, IThumbnail, IQuery, IOperation {
		}

		/**
		 * AMCP Media-commands
		 */
		export interface IVideo {
			loadbg(channel: number, layer: number, clip: string, loop?: boolean, transition?: Enum.Transition|string, transitionDuration?: number, transitionEasing?: Enum.Ease|string, transitionDirection?: Enum.Direction|string, seek?: number, length?: number, filter?: string, auto?: boolean|number|string): IAMCPCommand;
			load(channel: number, layer: number, clip: string, loop?: boolean, transition?: Enum.Transition|string, transitionDuration?: number, transitionEasing?: Enum.Ease|string, transitionDirection?: Enum.Direction|string, seek?: number, length?: number, filter?: string, auto?: boolean|number|string): IAMCPCommand;
			play(channel: number, layer?: number, clip?: string, loop?: boolean, transition?: Enum.Transition|string, transitionDuration?: number, transitionEasing?: Enum.Ease|string, transitionDirection?: Enum.Direction|string, seek?: number, length?: number, filter?: string, auto?: boolean|number|string): IAMCPCommand;
			pause(channel: number, layer?: number): IAMCPCommand;
			resume(channel: number, layer?: number): IAMCPCommand;
			stop(channel: number, layer?: number): IAMCPCommand;
		}

		/**
		 * AMCP Template-commands
		 */
		export interface ICG {
			cgAdd(channel: number, layer: number, flashLayer: number, templateName: string, playOnLoad: boolean|number|string, data?: TemplateData): IAMCPCommand;
			cgPlay(channel: number, layer: number, flashLayer: number): IAMCPCommand;
			cgStop(channel: number, layer: number, flashLayer: number): IAMCPCommand;
			cgNext(channel: number, layer: number, flashLayer: number): IAMCPCommand;
			cgRemove(channel: number, layer: number, flashLayer: number): IAMCPCommand;
			cgClear(channel: number, layer?: number): IAMCPCommand;
			cgUpdate(channel: number, layer: number, flashLayer: number, data: TemplateData): IAMCPCommand;
			cgInvoke(channel: number, layer: number, flashLayer: number, methodName: string): IAMCPCommand;
		}

		/**
		 * AMCP Mixer-commands
		 */
		export interface IMixer {
			mixerKeyer(channel: number, layer?: number, state?: number|boolean, defer?: boolean): IAMCPCommand;
			mixerKeyerDeferred(channel: number, layer?: number, state?: number|boolean): IAMCPCommand;
			getMixerStatusKeyer(channel: number, layer?: number): IAMCPCommand;
			mixerChroma(channel: number, layer?: number, keyer?: Enum.Chroma|string, threshold?: number, softness?: number, spill?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerChromaDeferred(channel: number, layer?: number, keyer?: Enum.Chroma|string, threshold?: number, softness?: number, spill?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusChroma(channel: number, layer?: number): IAMCPCommand;
			mixerBlend(channel: number, layer?: number, blendmode?: Enum.BlendMode|string, defer?: boolean): IAMCPCommand;
			mixerBlendDeferred(channel: number, layer?: number, blendmode?: Enum.BlendMode|string): IAMCPCommand;
			getMixerStatusBlend(channel: number, layer?: number): IAMCPCommand;
			mixerOpacity(channel: number, layer?: number, opacity?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerOpacityDeferred(channel: number, layer?: number, opacity?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusOpacity(channel: number, layer?: number): IAMCPCommand;
			mixerBrightness(channel: number, layer?: number, brightness?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerBrightnessDeferred(channel: number, layer?: number, brightness?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusBrightness(channel: number, layer?: number): IAMCPCommand;
			mixerSaturation(channel: number, layer?: number, saturation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerSaturationDeferred(channel: number, layer?: number, saturation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusSaturation(channel: number, layer?: number): IAMCPCommand;
			mixerBrightness(channel: number, layer?: number, contrast?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerContrastDeferred(channel: number, layer?: number, contrast?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusContrast(channel: number, layer?: number): IAMCPCommand;
			mixerLevels(channel: number, layer?: number, minInput?: number, maxInput?: number, gamma?: number, minOutput?: number, maxOutput?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerLevelsDeferred(channel: number, layer?: number, minInput?: number, maxInput?: number, gamma?: number, minOutput?: number, maxOutput?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusLevels(channel: number, layer?: number): IAMCPCommand;
			mixerFill(channel: number, layer?: number, x?: number, y?: number, xScale?: number, yScale?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerFillDeferred(channel: number, layer?: number, x?: number, y?: number, xScale?: number, yScale?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusFill(channel: number, layer?: number): IAMCPCommand;
			mixerClip(channel: number, layer?: number, x?: number, y?: number, width?: number, height?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerClipDeferred(channel: number, layer?: number, x?: number, y?: number, width?: number, height?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusClip(channel: number, layer?: number): IAMCPCommand;
			mixerAnchor(channel: number, layer?: number, x?: number, y?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerAnchorDeferred(channel: number, layer?: number, x?: number, y?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusAnchor(channel: number, layer?: number): IAMCPCommand;
			mixerCrop(channel: number, layer?: number, left?: number, top?: number, right?: number, bottom?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerCropDeferred(channel: number, layer?: number, left?: number, top?: number, right?: number, bottom?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusCrop(channel: number, layer?: number): IAMCPCommand;
			mixerRotation(channel: number, layer?: number, rotation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerRotationDeferred(channel: number, layer?: number, rotation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusRotation(channel: number, layer?: number): IAMCPCommand;
			mixerPerspective(channel: number, layer?: number, topLeftX?: number, topLeftY?: number, topRightX?: number, topRightY?: number, bottomRightX?:  number, bottomRightY?: number, bottomLeftX?: number, bottomLeftY?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerPerspectiveDeferred(channel: number, layer?: number, topLeftX?: number, topLeftY?: number, topRightX?: number, topRightY?: number, bottomRightX?:  number, bottomRightY?: number, bottomLeftX?: number, bottomLeftY?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusPerspective(channel: number, layer?: number): IAMCPCommand;
			mixerMipmap(channel: number, layer?: number, state?: number|boolean, defer?: boolean): IAMCPCommand;
			mixerMipmapDeferred(channel: number, layer?: number, state?: number|boolean): IAMCPCommand;
			getMixerStatusMipmap(channel: number, layer?: number): IAMCPCommand;
			mixerVolume(channel: number, layer?: number, volume?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerVolumeDeferred(channel: number, layer?: number, volume?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			getMixerStatusVolume(channel: number, layer?: number): IAMCPCommand;
			mixerMastervolume(channel: number, mastervolume?: number, defer?: boolean): IAMCPCommand;
			mixerMastervolumeDeferred(channel: number, mastervolume?: number): IAMCPCommand;
			getMixerStatusMastervolume(channel: number, layer?: number): IAMCPCommand;
			mixerStraightAlphaOutput(channel: number, layer?: number, state?: number|boolean, defer?: boolean): IAMCPCommand;
			mixerStraightAlphaOutputDeferred(channel: number, layer?: number, state?: number|boolean): IAMCPCommand;
			getMixerStatusStraightAlphaOutput(channel: number, layer?: number): IAMCPCommand;
			mixerGrid(channel: number, resolution: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
			mixerGridDeferred(channel: number, resolution: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
			mixerCommit(channel: number): IAMCPCommand;
			mixerClear(channel: number, layer?: number): IAMCPCommand;
		}

		/**
		 * AMCP Channel-commands
		 */
		export interface IChannel {
			clear(channel: number, layer?: number): IAMCPCommand;
		////	call(channel: number, layer: number): IAMCPCommand;
		////	swap(): IAMCPCommand;
		////	add(channel: number): IAMCPCommand;
		////	remove(channel: number): IAMCPCommand;
			print(channel: number): IAMCPCommand;
		////	set(channel: number): IAMCPCommand;
			lock(channel: number, action: Enum.Lock|string, lockPhrase?: string): IAMCPCommand;
			channelGrid(): IAMCPCommand;
			glGC(): IAMCPCommand;
		}

		/**
		 * AMCP Template Data-commands
		 */
		export interface IData {
			dataStore(fileName: string, data: TemplateData): IAMCPCommand;
			dataRetrieve(fileName: string): IAMCPCommand;
			dataList(): IAMCPCommand;
			dataRemove(fileName: string): IAMCPCommand;
		}

		/**
		 * AMCP Thumbnail-commands
		 */
		export interface IThumbnail {
			thumbnailList(): IAMCPCommand;
			thumbnailRetrieve(fileName: string): IAMCPCommand;
			thumbnailGenerate(fileName: string): IAMCPCommand;
			thumbnailGenerateAll(): IAMCPCommand;
		}

		/**
		 * AMCP Query-commands
		 */
		export interface IQuery {
			cinf(fileName: string): IAMCPCommand;
			cls(): IAMCPCommand;
			fls(): IAMCPCommand;
			tls(): IAMCPCommand;
			version(component?: Enum.Version): IAMCPCommand;
			info(channel?: number, layer?: number): IAMCPCommand;
			infoTemplate(template: string): IAMCPCommand;
			infoConfig(): IAMCPCommand;
			infoPaths(): IAMCPCommand;
			infoSystem(): IAMCPCommand;
			infoServer(): IAMCPCommand;
			infoQueues(): IAMCPCommand;
			infoThreads(): IAMCPCommand;
			infoDelay(channel: number, layer?: number): IAMCPCommand;
			cgInfo(channel: number, layer?: number, flashLayer?: number): IAMCPCommand;
			templateHostInfo(channel: number, layer?: number);
			glInfo(): IAMCPCommand;
			logLevel(level: Enum.LogLevel|string): IAMCPCommand;
			logCategory(category: Enum.LogCategory|string, enabled: boolean): IAMCPCommand;
			logCalltrace(enabled: boolean): IAMCPCommand;
			logCommunication(enabled: boolean): IAMCPCommand;
			diag(): IAMCPCommand;
			help(command?: Enum.Command|string): IAMCPCommand;
			getCommands(): IAMCPCommand;
			helpProducer(producer?: Enum.Producer|string): IAMCPCommand;
			getProducers(): IAMCPCommand;
			helpConsumer(consumer?: Enum.Consumer|string): IAMCPCommand;
			getConsumers(): IAMCPCommand;
		}

		/**
		 * AMCP Operation-commands
		 */
		export interface IOperation {
			bye(): IAMCPCommand;
			kill(): IAMCPCommand;
			restart(): IAMCPCommand;
		}
	}
}

/**
 * CasparCG Interface
 */
export interface ICasparCGConnection {
	connected: boolean;
	connectionStatus: SocketState;
	commandQueue: Array<IAMCPCommand>;
	connect(options?: IConnectionOptions): void;
	disconnect(): void;
	do(command: IAMCPCommand): IAMCPCommand;
	do(commandString: string, ...params: (string|Param)[]): IAMCPCommand;
}

/**
 * The main object and entrypoint for all interactions. `CasparCG` allows for flexible configuration, re-configuration and events/callbacks.
 * It implements all [[AMCP]] commands as high-level methods with convenient interfaces.
 * 
 * There is a single [[CasparCGSocket]] pr. `CasparCG` object. 
 * `CasparCG` should be the only public interface to interact directly with.
 */
export class CasparCG extends EventEmitter implements ICasparCGConnection, IConnectionOptions, CasparCGProtocols.v2_1.AMCP {
	private _connected: boolean = false;
	private _host: string;
	private _port: number;
	private _socket: CasparCGSocket;
	private _commandQueue: Array<IAMCPCommand> = new Array<IAMCPCommand>();
	private _currentCommand: IAMCPCommand;

	/**
	 * Try to connect upon creation.
	 */
	public autoConnect: boolean = undefined;

	/**
	 * Try to reconnect in case of unintentionally loss of connection, or in case of failed connection in the first place.
	 */
	public autoReconnect: boolean = undefined;

	/**
	 * Timeout in milliseconds between each connection attempt during reconnection.
	 */
	public autoReconnectInterval: number = undefined;

	/**
	 * Max number of attempts of connection during reconnection. This value resets once the reconnection is over (either in case of successfully reconnecting, changed connection properties such as `host` or `port` or by being manually cancelled). 
	 */
	public autoReconnectAttempts: number = undefined;

	/**
	 * All logging should be printed to the `Console`, in addition to the optinal [[onLog]] and [[LogEvent.LOG]].  
	 */
	public debug: boolean = undefined;

	/**
	 * @todo	Add documentation
	 */
	public onLog: IStringCallback = undefined;

	/**
	 * @todo	Add documentation
	 */
	public onConnectionStatus: ISocketStatusCallback = undefined;

	/**
	 * `connected` changed status between `true` and `false` or vice versa.
	 */
	public onConnectionChanged: IBooleanCallback = undefined;

	/**
	 * `connected` was set to `true`.
	 */
	public onConnected: IBooleanCallback = undefined;

	/**
	 * `connected` was set to `false`.
	 */
	public onDisconnected: IBooleanCallback = undefined;

	/**
	 * @todo	Add documentation
	 */
	public onError: IErrorCallback = undefined;

	/**
	 * If the constructor gets called with no parameters, all properties of the CasparCG object will match all default properties defined by [[IConnectionOptions]].
	 * 
	 ```
	 var con = new CasparCG(); 	
	 // host = 127.0.0.1, port = 5250, autoConnect = true ...
	 
	  con.play(1, 1, "amb");		
	  // you can interact with the server, but you have no knowledge of the conenction status until the onConnect event- or callback gets invoked
	 // the `PlayCommand` will however be queued and fired when the connection gets established
	 con.close();
	 ```
	 *  
	 * @param host		Defaults to `IConnectionOptions.host`
	 * @param port		Defaults to `IConnectionOptions.host`
	 * @param options	An object with combination of properties defined by `IConnectionOptions`. All properties not explicitly set will fall back to the defaults defined by `IConnectionOptions`. 
	 *
	 * All callbacks including [[onConnected]] will be set prior trying to establish connection, so the `CasparCG` object will give back all events even if [[CasparCG.autoConnect]] is `true`.
	 */
	public constructor();
	/**
	 * Set host/port directly in constructor:
	 * 
	 ```
	 var con = new CasparCG("192.168.0.1", 5251);	
	 // host = 192.168.0.1, port = 5251, autoConnect = true ...

	 // change parameters after the constructor
	 con.debug = true;
	 
	 con.play(1, 1, "amb");
	 con.close();
	 ```
	 *
	 */
	public constructor(host?: string, port?: number);
	/**
	 * Callbacks and events after constructor:
	 * 
	 ```
	 var con = new CasparCG({host: "192.168.0.1", autoConnect: false});	
	 // host = 192.168.0.1, port = 5250, autoConnect = false ...
	 
	 // add onLog callback after constructor
	 con.onLog = function(logMessage){ console.log(logMessage); };						
	 
	 // add eventlistener to the conenction event before connecting
	 con.on(CasparCGSocketStausEvent.CONNECTED, onConnection(event));		
	 
	 con.connect();
	 ```
	 * Callback in constructor:
	 * 
	 ```
	 var con = new CasparCG({host: "192.168.0.1", onConnect: onConnectedCallback});	
	 // Connection callbacks can be set in the constructor and will be registered before autoConnect invokes. 
	 // This ensures that you recieve all callbacks
	 ```
	 * Inline function synstax:
	 * 
	 ```
	 var con = new CasparCG({host: "192.168.0.1", onConnect: function(connected) {
		 	// do something once we get online
		 	console.log("Are we conencted?", connected)
	 	}
	});	
	 ```
	 * Inline fat arrow synstax:
	 * 
	 ```
	 var con = new CasparCG({host: "192.168.0.1", onConnect: (connected) => {
		 	// do something once we get online
		 	console.log("Are we conencted?", connected)
	 	}
	});	
	 ```
	 *
	 */
	public constructor(options?: IConnectionOptions);
	public constructor(hostOrOptions?: any, port?: number) {
		super();

		let options: ConnectionOptions = new ConnectionOptions(hostOrOptions, port);

		// if both options and port specified, port overrides options
		if (port && (port !== options.port)) {
			options.port = port;
		}

		this._createNewSocket(options);

		if (this.autoConnect) {
			this.connect();
		}
	}

	/**
	 * 
	 */
	private _createNewSocket(options?: IConnectionOptions, enforceRecreation: boolean = false): void {
		let hasNewOptions = false;
		for (let key in options) {

			// @todo: object.assign
			if (!options.hasOwnProperty(key)) {
				continue;
}
			if (this.hasOwnProperty(key) ||  CasparCG.prototype.hasOwnProperty(key)) {
				// only update new options
				if (this[key] !== options[key]) {
					this[key] = options[key];
					hasNewOptions = true;
				}
			}
		}
		// dont recreate if exising socket, same options + host + port
		if (this._socket && (this._socket.host !== this.host)) {
			hasNewOptions = true;
		}
		if (this._socket && (this._socket.port !== this.port)) {
			hasNewOptions = true;
		}
		if (this._socket && !hasNewOptions && !enforceRecreation) {
			return;
		}

		// clean up if existing socket
		if (this._socket) {
			this._socket.dispose();
			delete this._socket;
		}
		this._socket = new CasparCGSocket(this.host, this.port, this.autoReconnect, this.autoReconnectInterval, this.autoReconnectAttempts);
		this.setParent(this._socket);
		this._socket.on("error", (error) => this._onSocketError(error));
		this.on(CasparCGSocketStausEvent.STATUS, (event) => this._onSocketStatusChange(event));
		this.on(CasparCGSocketCommandEvent.RESPONSE, (command) => this._handleCommandResponse(command));

		// inherit log method
		this._socket.log = (args) => this._log(args);
	}

	/**
	 * Creates a new [[CasparCGSocket]] and connects.
	 * 
	 * @param options	Setting new [[ICasparCGConnection]] properties will override each individual property allready defined on the `CasparCG` object. Existing properties not overwritten by this `options` object will remain.
	 */
	public connect(options?: IConnectionOptions): void {
		// recreate socket if new options
		if (options) {
			this._createNewSocket(options);
		}
		if (this._socket) {
			this._socket.connect();
		}
	}

	/**
	 * Disconnects and disposes the [[CasparCGSocket]] connection.
	 */
	public disconnect(): void {
		if (this._socket) {
			this._socket.disconnect();
		}
	}

	/**
	 * 
	 */
	public get host(): string{
		return this._host;
	}

	/**
	 * Setting the `host` will create a new [[CasparCGSocket]] connection.
	 * 
	 * The new `CasparCGSocket` will `autoConnect` if the old socket was either successfully connected, or currently reconnecting. Changing the host resets the number of [[CasparCG.autoReconnectAttempts]]. 
	 */
	public set host(host: string){
		if (this._host !== host) {
			this._host = host;
			if (this._socket !=  null) {
				let shouldReconnect = (this.connected ||  ((this._socket.socketStatus & SocketState.reconnecting) === SocketState.reconnecting));
				this._createNewSocket();
				if (shouldReconnect) {
					this.connect();
				}
			}
		}
	}

	/**
	 * 
	 */
	public get port(): number{
		return this._port;
	}

	/**
	 * Setting the `port` will create a new [[CasparCGSocket]] connection.
	 * 
	 * The new `CasparCGSocket` will `autoConnect` if the old socket was either successfully connected, or currently reconnecting. Changing the host resets the number of [[CasparCG.autoReconnectAttempts]].
	 */
	public set port(port: number){
		if (this._port !== port) {
			this._port = port;
			if (this._socket !=  null) {
				let shouldReconnect = (this.connected ||  ((this._socket.socketStatus & SocketState.reconnecting) === SocketState.reconnecting));
				this._createNewSocket();
				if (shouldReconnect) {
					this.connect();
				}
			}
		}
	}

	/**
	 * 
	 */
	public get connected(): boolean{
		return this._connected ||  false;
	}

	/**
	 * 
	 */
	public get connectionStatus(): SocketState{
		return this._socket.socketStatus;
	}

	/**
	 * 
	 */
	private _onSocketStatusChange(socketStatus: CasparCGSocketStausEvent): void {
		let connected = (socketStatus.valueOf() &  SocketState.connected) === SocketState.connected;

		if (this.onConnectionStatus) {
			this.onConnectionStatus(socketStatus.valueOf());
		}

		if (connected !== this._connected) {
			this._connected = connected;
			this.fire(CasparCGSocketStausEvent.STATUS_CHANGED, socketStatus);

			if (this.onConnectionChanged) {
				this.onConnectionChanged(this._connected);
			}
			if (this._connected) {
				this.fire(CasparCGSocketStausEvent.CONNECTED, socketStatus);
				if (this.onConnected) {
					this.onConnected(this._connected);
				}

				this._expediteCommand();

			}
			if (!this._connected) {
				this.fire(CasparCGSocketStausEvent.DISCONNECTED, socketStatus);
				if (this.onDisconnected) {
					this.onDisconnected(this._connected);
				}
			}
		}
	}

	/**
	 * 
	 */
	public get commandQueue(): Array<IAMCPCommand> {
		return this._commandQueue;
	}

	/**
	 * 
	 */
	private _onSocketError(error: Error): void {
		// error callback
		if (this.onError) {
			this.onError(error);
		}

		// re-emit socket's error if CasparCG has listener
		if (this.listenerCount("error") > 0) {
			this.fire("error", error);
		}
	}

	/**
	 * 
	 */
	private _log(args: any): void {
		if (this.onLog) {
			this.onLog(args);
		}

		if (args instanceof Error) {
			console.error(args);
		} else if (this.debug) {
			console.log(args);
		}
		this.fire(LogEvent.LOG, new LogEvent(args));
	}

	/**
	 * @todo	implement
	 * @todo	document
	 */
	public do(command: IAMCPCommand): IAMCPCommand;
	public do(commandString: string, ...params: (string|Param)[]): IAMCPCommand;
	public do(commandOrString: (IAMCPCommand|string), ...params: (string|Param)[]) {
		let command: IAMCPCommand;

		if (isIAMCPCommand(commandOrString)) {
			command = commandOrString as IAMCPCommand;
		}else if (typeof commandOrString === "string") {
			if (AMCP.hasOwnProperty(commandOrString)) {
				// @todo: typechecking with fallback
				command = Object.create(AMCP[commandOrString]["prototype"]);
				// @todo: typechecking with fallback
				command.constructor.apply(command, params);
			}
		}else {
			// @todo: Handle, return?
			throw new Error("Invalid command or commandstring");
		}
		// validate command and params
		if (!command.validateParams()) {
			// handle error, return??
			return null;
		}

		return this._queueCommand(command);
	}


	/**
	 * 
	 */
	private _queueCommand(command: IAMCPCommand): IAMCPCommand {
		this._commandQueue.push(command);
		command.status = IAMCPStatus.Queued;
		if (!this._currentCommand) {
			this._expediteCommand();
		}

		return command;
	}

	/**
	 * 
	 */
	private _handleCommandResponse(command: IAMCPCommand): void {
		// @todo: handle check if command._id matches currentCommand._id;

		// param below
		// true if valid, handle if not
		this._expediteCommand(true);
	}

	/**
	 * 
	 */
	private _expediteCommand(forceNext: boolean = false): void {
		if (this.connected) {

			if (!forceNext && this._currentCommand) {
				// @todo add TTL for cleanup on stuck commands
				return;
			}

			if (forceNext) {
				delete this._currentCommand;
			}

			if (this._commandQueue.length > 0) {
				let nextCommand: IAMCPCommand = this._commandQueue.shift();
				this._currentCommand = nextCommand;
				this._socket.executeCommand(nextCommand);
			}
		}
	}



				///*********************////
				///***		API		****////
				///*********************///

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#LOADBG>
	 */
	public loadbg(channel: number, layer: number = undefined, clip: string, loop?: boolean, transition?: Enum.Transition|string, transitionDuration?: number, transitionEasing?: Enum.Ease|string, transitionDirection?: Enum.Direction|string, seek?: number, length?: number, filter?: string, auto?: boolean|number|string): IAMCPCommand {
		return this.do(new AMCP.LoadbgCommand({channel: channel, layer: layer, clip: clip, loop: loop, transition: transition, transitionDuration: transitionDuration, transitionEasing: transitionEasing, transitionDirection: transitionDirection, seek: seek, length: length, filter: filter, auto: auto}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#LOAD>
	 */
	public load(channel: number, layer: number = undefined, clip: string, loop?: boolean, transition?: Enum.Transition|string, transitionDuration?: number, transitionEasing?: Enum.Ease|string, transitionDirection?: Enum.Direction|string, seek?: number, length?: number, filter?: string, auto?: boolean|number|string): IAMCPCommand {
		return this.do(new AMCP.LoadCommand({channel: channel, layer: layer, clip: clip, loop: loop, transition: transition, transitionDuration: transitionDuration, transitionEasing: transitionEasing, transitionDirection: transitionDirection, seek: seek, length: length, filter: filter, auto: auto}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#PLAY>
	 */
	public play(channel: number, layer?: number): IAMCPCommand;
	public play(channel: number, layer: number, clip?: string, loop?: boolean, transition?: Enum.Transition|string, transitionDuration?: number, transitionEasing?: Enum.Ease|string, transitionDirection?: Enum.Direction|string, seek?: number, length?: number, filter?: string, auto?: boolean|number|string): IAMCPCommand;
	public play(channel: number, layer: number = undefined, clip?: string, loop?: boolean, transition?: Enum.Transition|string, transitionDuration?: number, transitionEasing?: Enum.Ease|string, transitionDirection?: Enum.Direction|string, seek?: number, length?: number, filter?: string, auto?: boolean|number|string): IAMCPCommand {
		return this.do(new AMCP.PlayCommand({channel: channel, layer: layer, clip: clip, loop: loop, transition: transition, transitionDuration: transitionDuration, transitionEasing: transitionEasing, transitionDirection: transitionDirection, seek: seek, length: length, filter: filter, auto: auto}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#PAUSE>
	 */
	public pause(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.PauseCommand({channel: channel, layer: layer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#RESUME>
	 */
	public resume(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.ResumeCommand({channel: channel, layer: layer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#STOP>
	 */
	public stop(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.StopCommand({channel: channel, layer: layer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_ADD>
	 */
	public cgAdd(channel: number, layer: number = undefined, flashLayer: number = undefined, templateName: string, playOnLoad?: boolean|number|string, data?: TemplateData): IAMCPCommand {
		return this.do(new AMCP.CGAddCommand({channel: channel, layer: layer, flashLayer: flashLayer, templateName: templateName, playOnLoad: playOnLoad, data: data}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_PLAY>
	 */
	public cgPlay(channel: number, layer?: number, flashLayer?: number): IAMCPCommand {
		return this.do(new AMCP.CGPlayCommand({channel: channel, layer: layer, flashLayer: flashLayer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_STOP>
	 */
	public cgStop(channel: number, layer?: number, flashLayer?: number): IAMCPCommand {
		return this.do(new AMCP.CGStopCommand({channel: channel, layer: layer, flashLayer: flashLayer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_NEXT>
	 */
	public cgNext(channel: number, layer?: number, flashLayer?: number): IAMCPCommand {
		return this.do(new AMCP.CGNextCommand({channel: channel, layer: layer, flashLayer: flashLayer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_REMOVE> 
	 */
	public cgRemove(channel: number, layer?: number, flashLayer?: number): IAMCPCommand {
		return this.do(new AMCP.CGRemoveCommand({channel: channel, layer: layer, flashLayer: flashLayer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_CLEAR>
	 */
	public cgClear(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.CGClearCommand({channel: channel, layer: layer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_UPDATE>
	 */
	public cgUpdate(channel: number, layer: number = undefined, flashLayer: number, data: TemplateData): IAMCPCommand {
		return this.do(new AMCP.CGUpdateCommand({channel: channel, layer: layer, flashLayer: flashLayer, data: data}));
	}

	/*
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_INVOKE
	 */
	public cgInvoke(channel: number, layer: number, flashLayer: number, method: string): IAMCPCommand {
		return this.do(new AMCP.CGRemoveCommand({channel: channel, layer: layer, flashLayer: flashLayer, method: method}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_KEYER>
	 */
	public mixerKeyer(channel: number, layer?: number): IAMCPCommand;
	public mixerKeyer(channel: number, layer: number, state: number|boolean, defer?: boolean): IAMCPCommand;
	public mixerKeyer(channel: number, layer?: number, state?: number|boolean, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerKeyerCommand({channel: channel, layer: layer, keyer: state, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_KEYER>
	 */
	public mixerKeyerDeferred(channel: number, layer: number, state?: number|boolean): IAMCPCommand {
		return this.mixerKeyer(channel, layer, state, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_KEYER>
	 */
	public getMixerStatusKeyer(channel: number, layer?: number): IAMCPCommand {
		return this.mixerKeyer(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CHROMA>
	 */
	public mixerChroma(channel: number, layer?: number): IAMCPCommand;
	public mixerChroma(channel: number, layer: number, keyer: Enum.Chroma, threshold: number, softness: number, spill: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerChroma(channel: number, layer: number, keyer: string, threshold: number, softness: number, spill: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerChroma(channel: number, layer: number, keyer?: Enum.Chroma|string, threshold?: number, softness?: number, spill?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerChroma(channel: number, layer: number = 0, keyer?: Enum.Chroma|string, threshold?: number, softness?: number, spill?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerChromaCommand({channel: channel, layer: layer, keyer: keyer, threshold: threshold, softness: softness, spill: spill, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CHROMA>
	 */
	public mixerChromaDeferred(channel: number, layer: number, keyer: Enum.Chroma, threshold: number, softness: number, spill: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
	public mixerChromaDeferred(channel: number, layer: number, keyer: string, threshold: number, softness: number, spill: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand;
	public mixerChromaDeferred(channel: number, layer: number = 0, keyer: Enum.Chroma|string, threshold: number, softness: number, spill: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerChroma(channel, layer, keyer, threshold, softness, spill, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CHROMA>
	 */
	public getMixerStatusChroma(channel: number, layer?: number): IAMCPCommand {
		return this.mixerChroma(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_BLEND>
	 */
	public mixerBlend(channel: number, layer?: number): IAMCPCommand;
	public mixerBlend(channel: number, layer: number, blendmode: Enum.BlendMode, defer?: boolean): IAMCPCommand;
	public mixerBlend(channel: number, layer: number, blendmode: string, defer?: boolean): IAMCPCommand;
	public mixerBlend(channel: number, layer?: number, blendmode?: Enum.BlendMode|string, defer?: boolean): IAMCPCommand;
	public mixerBlend(channel: number, layer?: number, blendmode?: Enum.BlendMode|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerBlendCommand({channel: channel, layer: layer, blendmode: blendmode, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_BLEND>
	 */
	public mixerBlendDeferred(channel: number, layer: number, blendmode: Enum.BlendMode): IAMCPCommand;
	public mixerBlendDeferred(channel: number, layer: number, blendmode: string): IAMCPCommand;
	public mixerBlendDeferred(channel: number, layer: number = undefined, blendmode: Enum.BlendMode|string): IAMCPCommand {
		return this.mixerBlend(channel, layer, blendmode, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_BLEND>
	 */
	public getMixerStatusBlend(channel: number, layer?: number): IAMCPCommand {
		return this.mixerBlend(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_OPACITY>
	 */
	public mixerOpacity(channel: number, layer?: number): IAMCPCommand;
	public mixerOpacity(channel: number, layer: number, opacity: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerOpacity(channel: number, layer: number, opacity: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerOpacity(channel: number, layer?: number, opacity?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerOpacity(channel: number, layer?: number, opacity?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerOpacityCommand({channel: channel, layer: layer, opacity: opacity, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_OPACITY>
	 */
	public mixerOpacityDeferred(channel: number, layer: number = undefined, opacity: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerOpacity(channel, layer, opacity, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_OPACITY>
	 */
	public getMixerStatusOpacity(channel: number, layer?: number): IAMCPCommand {
		return this.mixerOpacity(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_BRIGHTNESS>
	 */
	public mixerBrightness(channel: number, layer?: number): IAMCPCommand;
	public mixerBrightness(channel: number, layer: number, brightness: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerBrightness(channel: number, layer: number, brightness: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerBrightness(channel: number, layer?: number, brightness?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerBrightness(channel: number, layer?: number, brightness?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerBrightnessCommand({channel: channel, layer: layer, brightness: brightness, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_BRIGHTNESS>
	 */
	public mixerBrightnessDeferred(channel: number, layer: number = undefined, brightness: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerBrightness(channel, layer, brightness, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_BRIGHTNESS>
	 */
	public getMixerStatusBrightness(channel: number, layer?: number): IAMCPCommand {
		return this.mixerBrightness(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_SATURATION>
	 */
	public mixerSaturation(channel: number, layer?: number): IAMCPCommand;
	public mixerSaturation(channel: number, layer: number, saturation: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerSaturation(channel: number, layer: number, saturation: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerSaturation(channel: number, layer?: number, saturation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerSaturation(channel: number, layer?: number, saturation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerSaturationCommand({channel: channel, layer: layer, saturation: saturation, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_SATURATION>
	 */
	public mixerSaturationDeferred(channel: number, layer: number = undefined, saturation: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerSaturation(channel, layer, saturation, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_SATURATION>
	 */
	public getMixerStatusSaturation(channel: number, layer?: number): IAMCPCommand {
		return this.mixerSaturation(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CONTRAST>
	 */
	public mixerContrast(channel: number, layer?: number): IAMCPCommand;
	public mixerContrast(channel: number, layer: number, contrast: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerContrast(channel: number, layer: number, contrast: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerContrast(channel: number, layer?: number, contrast?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerContrast(channel: number, layer?: number, contrast?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerContrastCommand({channel: channel, layer: layer, contrast: contrast, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CONTRAST>
	 */
	public mixerContrastDeferred(channel: number, layer: number = undefined, contrast: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerContrast(channel, layer, contrast, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CONTRAST>
	 */
	public getMixerStatusContrast(channel: number, layer?: number): IAMCPCommand {
		return this.mixerContrast(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_LEVELS>
	 */
	public mixerLevels(channel: number, layer?: number): IAMCPCommand;
	public mixerLevels(channel: number, layer: number, minInput: number, maxInput: number, gamma: number, minOutput: number, maxOutput: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerLevels(channel: number, layer: number, minInput: number, maxInput: number, gamma: number, minOutput: number, maxOutput: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerLevels(channel: number, layer: number, minInput: number, maxInput: number, gamma: number, minOutput: number, maxOutput: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerLevels(channel: number, layer: number = undefined, minInput?: number, maxInput?: number, gamma?: number, minOutput?: number, maxOutput?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerLevelsCommand({channel: channel, layer: layer, minInput: minInput, maxInput: maxInput, gamma: gamma, minOutput: minOutput, maxOutput: maxOutput, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_LEVELS>
	 */
	public mixerLevelsDeferred(channel: number, layer: number = undefined, minInput: number, maxInput: number, gamma: number, minOutput: number, maxOutput: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerLevels(channel, layer, minInput, maxInput, gamma, minOutput, maxOutput, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_LEVELS>
	 */
	public getMixerStatusLevels(channel: number, layer?: number): IAMCPCommand {
		return this.mixerLevels(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_FILL>
	 */
	public mixerFill(channel: number, layer?: number): IAMCPCommand;
	public mixerFill(channel: number, layer: number, x: number, y: number, xScale: number, yScale: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerFill(channel: number, layer: number, x: number, y: number, xScale: number, yScale: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerFill(channel: number, layer: number, x: number, y: number, xScale: number, yScale: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerFill(channel: number, layer: number = undefined, x?: number, y?: number, xScale?: number, yScale?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerFillCommand({channel: channel, layer: layer, x: x, y: y, xScale: xScale, yScale: yScale, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/*
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_FILL>
	 */
	public mixerFillDeferred(channel: number, layer: number = undefined, x: number, y: number, xScale: number, yScale: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerFill(channel, layer, x, y, xScale, yScale, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_FILL>
	 */
	public getMixerStatusFill(channel: number, layer?: number): IAMCPCommand {
		return this.mixerFill(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CLIP>
	 */
	public mixerClip(channel: number, layer?: number): IAMCPCommand;
	public mixerClip(channel: number, layer: number, x: number, y: number, width: number, height: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerClip(channel: number, layer: number, x: number, y: number, width: number, height: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerClip(channel: number, layer: number, x: number, y: number, width: number, height: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerClip(channel: number, layer: number = undefined, x?: number, y?: number, width?: number, height?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerClipCommand({channel: channel, layer: layer, x: x, y: y, width: width, height: height, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CLIP>
	 */
	public mixerClipDeferred(channel: number, layer: number = undefined, x: number, y: number, width: number, height: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerClip(channel, layer, x, y, width, height, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CLIP>
	 */
	public getMixerStatusClip(channel: number, layer?: number): IAMCPCommand {
		return this.mixerClip(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_ANCHOR>
	 */
	public mixerAnchor(channel: number, layer?: number): IAMCPCommand;
	public mixerAnchor(channel: number, layer: number, x: number, y: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerAnchor(channel: number, layer: number, x: number, y: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerAnchor(channel: number, layer: number, x: number, y: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerAnchor(channel: number, layer: number = undefined, x?: number, y?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerAnchorCommand({channel: channel, layer: layer, x: x, y: y, ransition: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_ANCHOR>
	 */
	public mixerAnchorDeferred(channel: number, layer: number = undefined, x: number, y: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerAnchor(channel, layer, x, y, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_ANCHOR>
	 */
	public getMixerStatusAnchor(channel: number, layer?: number): IAMCPCommand {
		return this.mixerAnchor(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CROP>
	 */
	public mixerCrop(channel: number, layer?: number): IAMCPCommand;
	public mixerCrop(channel: number, layer: number, left: number, top: number, right: number, bottom: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerCrop(channel: number, layer: number, left: number, top: number, right: number, bottom: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerCrop(channel: number, layer: number, left: number, top: number, right: number, bottom: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerCrop(channel: number, layer: number = undefined, left?: number, top?: number, right?: number, bottom?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerCropCommand({channel: channel, layer: layer, left: left, top: top, right: right, bottom: bottom, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CROP>
	 */
	public mixerCropDeferred(channel: number, layer: number = undefined, left: number, top: number, right: number, bottom: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerCrop(channel, layer, left, top, right, bottom, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CROP>
	 */
	public getMixerStatusCrop(channel: number, layer?: number): IAMCPCommand {
		return this.mixerCrop(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_ROTATION>
	 */
	public mixerRotation(channel: number, layer?: number): IAMCPCommand;
	public mixerRotation(channel: number, layer: number, rotation: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerRotation(channel: number, layer: number, rotation: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerRotation(channel: number, layer?: number, rotation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerRotation(channel: number, layer?: number, rotation?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerRotationCommand({channel: channel, layer: layer, rotation: rotation, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_ROTATION>
	 */
	public mixerRotationDeferred(channel: number, layer: number = undefined, rotation: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerRotation(channel, layer, rotation, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_ROTATION>
	 */
	public getMixerStatusRotation(channel: number, layer?: number): IAMCPCommand {
		return this.mixerRotation(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_PERSPECTIVE>
	 */
	public mixerPerspective(channel: number, layer?: number): IAMCPCommand;
	public mixerPerspective(channel: number, layer: number, topLeftX: number, topLeftY: number, topRightx: number, topRightY: number, bottomRightX: number, bottomRightY: number, bottmLeftX: number, bottomLeftY: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerPerspective(channel: number, layer: number, topLeftX: number, topLeftY: number, topRightx: number, topRightY: number, bottomRightX: number, bottomRightY: number, bottmLeftX: number, bottomLeftY: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerPerspective(channel: number, layer: number, topLeftX: number, topLeftY: number, topRightx: number, topRightY: number, bottomRightX: number, bottomRightY: number, bottmLeftX: number, bottomLeftY: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerPerspective(channel: number, layer: number = undefined, topLeftX?: number, topLeftY?: number, topRightx?: number, topRightY?: number, bottomRightX?: number, bottomRightY?: number, bottmLeftX?: number, bottomLeftY?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerPerspectiveCommand({channel: channel, layer: layer, topLeftX: topLeftX, topLeftY: topLeftY, topRightx: topRightx, topRightY: topRightY, bottomRightX: bottomRightX, bottomRightY: bottomRightY, bottmLeftX: bottmLeftX, bottomLeftY: bottomLeftY, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_PERSPECTIVE>
	 */
	public mixerPerspectiveDeferred(channel: number, layer: number = undefined, topLeftX: number, topLeftY: number, topRightx: number, topRightY: number, bottomRightX: number, bottomRightY: number, bottomLeftX: number, bottomLeftY: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.mixerPerspective(channel, layer, topLeftX, topLeftY, topRightx, topRightY, bottomRightX, bottomRightY, bottomLeftX, bottomLeftY, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_PERSPECTIVE>
	 */
	public getMixerStatusPerspective(channel: number, layer?: number): IAMCPCommand {
		return this.mixerPerspective(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_MIPMAP>
	 */
	public mixerMipmap(channel: number, layer?: number): IAMCPCommand;
	public mixerMipmap(channel: number, layer: number, state: number|boolean, defer?: boolean): IAMCPCommand;
	public mixerMipmap(channel: number, layer?: number, state?: number|boolean, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerMipmapCommand({channel: channel, layer: layer, keyer: state, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_MIPMAP>
	 */
	public mixerMipmapDeferred(channel: number, layer?: number, state?: number|boolean): IAMCPCommand {
		return this.mixerMipmap(channel, layer, state, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_MIPMAP>
	 */
	public getMixerStatusMipmap(channel: number, layer?: number): IAMCPCommand {
		return this.mixerMipmap(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_VOLUME>
	 */
	public mixerVolume(channel: number, layer?: number): IAMCPCommand;
	public mixerVolume(channel: number, layer: number, volume: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerVolume(channel: number, layer: number, volume: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerVolume(channel: number, layer?: number, volume?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerVolume(channel: number, layer?: number, volume?: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerVolumeCommand({channel: channel, layer: layer, volume: volume, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_VOLUME>
	 */
	public mixerVolumeDeferred(channel: number, layer: number = undefined, volume: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerVolume(channel, layer, volume, transitionDuration, transitionEasing, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_VOLUME>
	 */
	public getMixerStatusVolume(channel: number, layer?: number): IAMCPCommand {
		return this.mixerVolume(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_MASTERVOLUME>
	 */
	public mixerMastervolume(channel: number): IAMCPCommand;
	public mixerMastervolume(channel: number, mastervolume: number, defer?: boolean): IAMCPCommand;
	public mixerMastervolume(channel: number, mastervolume?: number, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerMastervolumeCommand({channel: channel, mastervolume: mastervolume, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_MASTERVOLUME>
	 */
	public mixerMastervolumeDeferred(channel: number, mastervolume?: number): IAMCPCommand {
		return this.mixerMastervolume(channel, mastervolume, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_MASTERVOLUME>
	 */
	public getMixerStatusMastervolume(channel: number): IAMCPCommand {
		return this.mixerMastervolume(channel);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_STRAIGHT_ALPHA_OUTPUT>
	 */
	public mixerStraightAlphaOutput(channel: number, layer?: number): IAMCPCommand;
	public mixerStraightAlphaOutput(channel: number, layer: number, state: number|boolean, defer?: boolean): IAMCPCommand;
	public mixerStraightAlphaOutput(channel: number, layer?: number, state?: number|boolean, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerKeyerCommand({channel: channel, layer: layer, keyer: state, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_STRAIGHT_ALPHA_OUTPUT>
	 */
	public mixerStraightAlphaOutputDeferred(channel: number, layer?: number, state?: number|boolean): IAMCPCommand {
		return this.mixerStraightAlphaOutput(channel, layer, state, true);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_STRAIGHT_ALPHA_OUTPUT>
	 */
	public getMixerStatusStraightAlphaOutput(channel: number, layer?: number): IAMCPCommand {
		return this.mixerStraightAlphaOutput(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_GRID>
	 */
	public mixerGrid(channel: number, resolution: number, transitionDuration?: number, transitionEasing?: Enum.Ease, defer?: boolean): IAMCPCommand;
	public mixerGrid(channel: number, resolution: number, transitionDuration?: number, transitionEasing?: string, defer?: boolean): IAMCPCommand;
	public mixerGrid(channel: number, resolution: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand;
	public mixerGrid(channel: number, resolution: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string, defer?: boolean): IAMCPCommand {
		return this.do(new AMCP.MixerGridCommand({channel: channel, resolution: resolution, transitionDuration: transitionDuration, easing: transitionEasing, defer: defer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_GRID>
	 */
	public mixerGridDeferred(channel: number, resolution: number, transitionDuration?: number, transitionEasing?: Enum.Ease|string): IAMCPCommand {
		return this.mixerGrid(channel, resolution, transitionDuration, transitionEasing, true);
	}


	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_COMMIT>
	 */
	public mixerCommit(channel: number): IAMCPCommand {
		return this.do(new AMCP.MixerCommitCommand({channel: channel}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#MIXER_CLEAR>
	 */
	public mixerClear(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.MixerClearCommand({channel: channel, layer: layer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CLEAR>
	 */
	public clear(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.ClearCommand({channel: channel, layer: layer}));
	}

	/**
	 * @todo	implement
	 * @todo	document
	 */
	public call(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.CallCommand({channel: channel, layer: layer}));
	}

	/**
	 * @todo	implement
	 * @todo	document
	 */
	public swap(): IAMCPCommand {
		// @todo: overloading of origin/destination pairs
		return this.do(new AMCP.SwapCommand());
	}

	/**
	 * @todo	implement
	 * @todo	document
	 */
	public add(channel: number): IAMCPCommand {
		// remember index /layer
			// i suggest duplicating abstractchannelorlayer to avoid problems if the address logic changes for layers and not indicies
		// consumer factoruies parses "consumer"-string parameter
		return this.do(new AMCP.AddCommand({channel: channel}));
	}

	/**
	 * @todo	implement
	 * @todo	document
	 */
	public remove(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.RemoveCommand({channel: channel, layer: layer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#PRINT>
	 */
	public print(channel: number): IAMCPCommand {
		return this.do(new AMCP.PrintCommand({channel: channel}));
	}

	/**
	 * @todo	implement
	 * @todo	document
	 */
	public set(channel: number): IAMCPCommand {
		// @todo:  param enum (only MODE and CHANNEL_LAYOUT for now)
		// @todo: switchable second parameter based on what to set:
			// mode = enum modes.......
			// layer = enum layouts..........
		return this.do(new AMCP.SetCommand({channel: 	channel}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#LOCK>
	 */
	public lock(channel: number, action: Enum.Lock, lockPhrase?: string): IAMCPCommand;
	public lock(channel: number, action: string, lockPhrase?: string): IAMCPCommand;
	public lock(channel: number, action: Enum.Lock|string, lockPhrase?: string): IAMCPCommand {
		return this.do(new AMCP.LockCommand({channel: channel, action: action, phrase: lockPhrase}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CHANNEL_GRID>
	 */
	public channelGrid(): IAMCPCommand {
		return this.do(new AMCP.ChannelGridCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#GL_GC>
	 */
	public glGC(): IAMCPCommand {
		return this.do(new AMCP.GlGCCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#DATA_STORE>
	 */
	public dataStore(fileName: string, data: TemplateData): IAMCPCommand {
		return this.do(new AMCP.DataStoreCommand({fileName: fileName, data: data}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#DATA_RETRIEVE>
	 */
	public dataRetrieve(fileName: string): IAMCPCommand {
		return this.do(new AMCP.DataRetrieveCommand({fileName: fileName}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#DATA_LIST>
	 */
	public dataList(): IAMCPCommand {
		return this.do(new AMCP.DataListCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#DATA_REMOVE>
	 */
	public dataRemove(fileName: string): IAMCPCommand {
		return this.do(new AMCP.DataRemoveCommand({fileName: fileName}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#THUMBNAIL_LIST>
	 */
	public thumbnailList(): IAMCPCommand {
		return this.do(new AMCP.ThumbnailListCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#THUMBNAIL_RETRIEVE>
	 */
	public thumbnailRetrieve(fileName: string): IAMCPCommand {
		return this.do(new AMCP.ThumbnailRetrieveCommand({fileName: fileName}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#THUMBNAIL_GENERATE>
	 */
	public thumbnailGenerate(fileName: string): IAMCPCommand {
		return this.do(new AMCP.ThumbnailGenerateCommand({fileName: fileName}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#THUMBNAIL_GENERATE_ALL>
	 */
	public thumbnailGenerateAll(): IAMCPCommand {
		return this.do(new AMCP.ThumbnailGenerateAllCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CINF>
	 */
	public cinf(fileName: string): IAMCPCommand {
		return this.do(new AMCP.CinfCommand({fileName: fileName}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CLS>
	 */
	public cls(): IAMCPCommand {
		return this.do(new AMCP.ClsCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#FLS>
	 */
	public fls(): IAMCPCommand {
		return this.do(new AMCP.FlsCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#TLS>
	 */
	public tls(): IAMCPCommand {
		return this.do(new AMCP.TlsCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#VERSION>
	 */
	public version(component?: Enum.Version): IAMCPCommand {
		return this.do(new AMCP.VersionCommand({component: component}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO>
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_2>
	 */
	public info(channel?: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.InfoCommand({channel: channel, layer: layer}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_TEMPLATE>
	 */
	public infoTemplate(template: string): IAMCPCommand {
		return this.do(new AMCP.InfoTemplateCommand({template: template}));
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_CONFIG>
	 */
	public infoConfig(): IAMCPCommand {
		return this.do(new AMCP.InfoConfigCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_PATHS>
	 */
	public infoPaths(): IAMCPCommand {
		return this.do(new AMCP.InfoPathsCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_SYSTEM>
	 */
	public infoSystem(): IAMCPCommand {
		return this.do(new AMCP.InfoSystemCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_SERVER>
	 */
	public infoServer(): IAMCPCommand {
		return this.do(new AMCP.InfoServerCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_QUEUES>
	 */
	public infoQueues(): IAMCPCommand {
		return this.do(new AMCP.InfoQueuesCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_THREADS>
	 */
	public infoThreads(): IAMCPCommand {
		return this.do(new AMCP.InfoThreadsCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#INFO_DELAY>
	 */
	public infoDelay(channel: number, layer?: number): IAMCPCommand {
		return this.do(new AMCP.InfoDelayCommand({channel: channel, layer: layer}));
	}

	/**
	 * Retrieves information about a running template or the templatehost.
	 * 
	 * Calling `infoDelay` without `flashLayer` parameter is the same as calling the convenience method [[templateHostInfo]].
	 * 
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_INFO>
	 * 
	 * @param flashLayer	If not specified, information about the `TemplateHost` will be returned.
	 */
	public cgInfo(channel: number, layer?: number, flashLayer?: number): IAMCPCommand {
		return this.do(new AMCP.CGInfoCommand({channel: channel, layer: layer, flashLayer: flashLayer}));
	}

	/**
	 * Convenience method for calling [[cgInfo]] to return information about `TemplateHost` for a given layer.
	 * 
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#CG_INFO>
	 */
	public templateHostInfo(channel: number, layer?: number): IAMCPCommand {
		return this.cgInfo(channel, layer);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#GL_INFO>
	 */
	public glInfo(): IAMCPCommand {
		return this.do(new AMCP.GlInfoCommand());
	}

	/**
	 * @param level		Loglevel set by using [[LogLevel]] enum.
	 */
	public logLevel(level: Enum.LogLevel): IAMCPCommand;
	/**
	 * @param level		LogLevel set by string.
	 */
	public logLevel(level: string): IAMCPCommand;
	/**
	 * Sets the server's [[LogLevel]].
	 * 
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#LOG_LEVEL>
	 */
	public logLevel(enumOrString: Enum.LogLevel|string): IAMCPCommand {
		return this.do(new AMCP.LogLevelCommand({level: enumOrString}));
	}

	/**
	 * Enabling or disabling logging for a given [[LogCategory]].
	 * 
	 * Convenience methods [[logCalltrace]] and [[logCommunication]] are available.
	 * 
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#LOG_CATEGORY>
	 */
	public logCategory(category: Enum.LogCategory, enabled: boolean): IAMCPCommand;
	public logCategory(category: string, enabled: boolean): IAMCPCommand;
	public logCategory(category: Enum.LogCategory|string, enabled: boolean): IAMCPCommand {
		let params: Param = {};
		params[category.toString().toLowerCase()] = enabled;
		return this.do(new AMCP.LogCategoryCommand(params));
	}
	/**
	 * Convenience method for enabling or disabling logging for [[LogCategory.CALLTRACE]] through calling [[logCategory]].
	 */
	public logCalltrace(enabled: boolean): IAMCPCommand {
		return this.logCategory(Enum.LogCategory.CALLTRACE, enabled);
	}
	/**
	 * Convenience method for enabling or disabling logging for [[LogCategory.COMMUNICATION]] through calling [[logCategory]].
	 */
	public logCommunication(enabled: boolean): IAMCPCommand {
		return this.logCategory(Enum.LogCategory.COMMUNICATION, enabled);
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#DIAG>
	 */
	public diag(): IAMCPCommand {
		return this.do(new AMCP.DiagCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#HELP>
	 */
	public help(): IAMCPCommand;
	public help(command?: Enum.Command): IAMCPCommand;
	public help(commandName?: string): IAMCPCommand;
	public help(commandOrName?: (Enum.Command|string)): IAMCPCommand {
		let param: Param = {};
		if (commandOrName) {
			param["command"] = commandOrName;
		}
		return this.do(new AMCP.HelpCommand(param));
	}

	/**
	 * Convenience method for calling [[help]] with no parameters.
	 * 
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#HELP>
	 */
	public getCommands(): IAMCPCommand {
		return this.help();
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#HELP_PRODUCER>
	 */
	public helpProducer(): IAMCPCommand;
	public helpProducer(producer: Enum.Producer): IAMCPCommand;
	public helpProducer(producerName: string): IAMCPCommand;
	public helpProducer(producerOrName?: (Enum.Producer|string)): IAMCPCommand {
		let param: Param = {};
		if (producerOrName) {
			param["producer"] = producerOrName;
		}
		return this.do(new AMCP.HelpProducerCommand(param));
	}

	/**
	 * Convenience method for calling [[helpProducer]] with no parameters.
	 * 
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#HELP_PRODUCER>
	 */
	public getProducers(): IAMCPCommand {
		return this.helpProducer();
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#HELP_CONSUMER>
	 */
	public helpConsumer(): IAMCPCommand;
	public helpConsumer(consumer: Enum.Consumer): IAMCPCommand;
	public helpConsumer(consumerName: string): IAMCPCommand;
	public helpConsumer(consumerOrName?: (Enum.Consumer|string)): IAMCPCommand {
		let param: Param = {};
		if (consumerOrName) {
			param["consumer"] = consumerOrName;
		}
		return this.do(new AMCP.HelpConsumerCommand(param));
	}

	/**
	 * Convenience method for calling [[helpConsumer]] with no parameters.
	 * 
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#HELP_CONSUMER>
	 */
	public getConsumers(): IAMCPCommand {
		return this.helpConsumer();
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#BYE>
	 */
	public bye(): IAMCPCommand {
		return this.do(new AMCP.ByeCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#KILL>
	 */
	public kill(): IAMCPCommand {
		return this.do(new AMCP.KillCommand());
	}

	/**
	 * <http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#RESTART>
	 */
	public restart(): IAMCPCommand {
		return this.do(new AMCP.RestartCommand());
	}
}