declare namespace Bind {

    export interface BinderStatic {
        bindToState?(data: any, key: string, path?: string, converter?: IValueConverter, converterParams?: any): Binding;
        bindTo(parent: any, path?: string, converter?: IValueConverter, converterParams?: any): Binding;
        bindArrayToState?(data: any, key: string, path?: string, converter?: IValueConverter, converterParams?: any): ArrayBinding;
        bindArrayTo(parent: any, path?: string, converter?: IValueConverter, converterParams?: any): ArrayBinding;
    }
    export interface Binding {
        value: any;
        path?: string;
    }
    export interface ArrayBinding {
        items: Array<Binding>;
        path?: string;
        add(defautItem?: any): any;
        remove(itemToRemove: any): any;
        splice(start: number, deleteCount: number, elementsToAdd?: any): any;
        move(x: number, y: number): any;
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
