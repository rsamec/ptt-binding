declare namespace Bind {

    export interface BinderStatic {
        bindToState?(data, key: string, path?: string, converter?: IValueConverter, converterParams?: any): ObjectBinding
        bindTo(parent, path?: string, converter?: IValueConverter, converterParams?: any): ObjectBinding
        bindArrayToState?(data, key: string, path?: string, converter?: IValueConverter, converterParams?: any): ArrayBinding
        bindArrayTo(parent, path?: string, converter?: IValueConverter, converterParams?: any): ArrayBinding
    }
    export interface Binding {
        path?: string;
        parent: Binding;
        root:Binding;
    }
    export interface ObjectBinding extends Binding {
        value: any;
    }
    export interface ArrayBinding extends Binding {
        items: Array<ObjectBinding>;
        add(defautItem?: any);
        remove(itemToRemove: any);
        splice(start: number, deleteCount: number, elementsToAdd?: any);
        move(x: number, y: number);
    }

    /**
     *  Provides a way to apply custom logic to a binding.
     *  It enables to make bi-directional convertions between source (data) and target (view) binding.
     *
     *  +   apply various formats to values
     *  +   parse values from user input
     */
    export interface IValueConverter {
        /**
         * Convert value into another value before return binding getter. Typically from model(data) to view.
         * @param value - source binding object (value)
         * @param parameters - enable parametrization of conversion
         */
        format?(value: any, parameters?: any): any;
        /**
         * Convert value into another value before call binding setter. Typically from view to model(data).
         * @param value - target binding object (value)
         * @param parameters - enable parametrization of conversion
         */
        parse?(value: any, parameters?: any): any;
    }
}
