import * as _ from 'lodash';

export default class SimpleCursor<T> implements Cursor.Provider<T> {
	path:Cursor.Path;
	constructor(public target: any, path?: Cursor.Path)
	{
		this.path =  path || [];
	}

	set(propName: string, value: any):T {

		var targetNode: T = this.getNodeByPath(this.path);
		if (targetNode === undefined) return;		
		_.set(targetNode,propName,value);
		return targetNode; //.set(propName, value);
	}
	get(propName: string): any {
		var targetNode: T = this.getNodeByPath(this.path);
		if (targetNode === undefined) return;
		return (<any>targetNode)[propName];
	}

	newCursor<K>(path?: Cursor.Path):Cursor.Provider<K> {
		if (path === undefined) return new SimpleCursor<K>(this.target, this.path);		
		//if (this.path === undefined) return undefined;		
		return new SimpleCursor<K>(this.target, this.path.concat(path));
	}

	private getNodeByPath(path: Cursor.Path): T {
		if (path === undefined || path.length === 0) return this.target;
		var targetNode: T = <T>_.get(this.target, path);
		return targetNode;
	}
}