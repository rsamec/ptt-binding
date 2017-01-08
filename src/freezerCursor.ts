import * as _ from 'lodash';

export default class FreezerCursor<T> implements Cursor.Provider<T> {
	path:Cursor.Path;
	constructor(public target: any, path?: Cursor.Path)
	{
		this.path =  path || [];
	}

	set(propName: string, value: any) {

		var targetNode: T = this.getNodeByPath(this.path);
		if (targetNode === undefined) return;
		return targetNode.set(propName, value);
	}
	get(propName: string): any {
		var targetNode: T = this.getNodeByPath(this.path);
		if (targetNode === undefined) return;
		return (<any>targetNode)[propName];
	}

	newCursor<K>(path?: Cursor.Path): FreezerCursor<K> {
		if (path === undefined) return new FreezerCursor<K>(this.target, this.path);		
		//if (this.path === undefined) return undefined;
		return new FreezerCursor<K>(this.target, this.path.concat(path));
	}

	private getNodeByPath(path: Cursor.Path): T {
		if (path === undefined || path.length === 0) return this.target.get();
		var targetNode: T = <T>_.get(this.target.get(), path);
		return targetNode;
	}
}