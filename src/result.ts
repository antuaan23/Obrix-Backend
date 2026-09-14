export class Result<T = void>{
    
    public readonly exitoso!: boolean;
    public readonly descripcion!: string;
    public readonly _resultado?: T;

    private constructor(exitoso: boolean, descripcion: string, resultado?: T){
        
        this.exitoso = exitoso;
        this.descripcion = descripcion;
        this._resultado = resultado;

        Object.freeze(this);
    }

    get resultado(): T {
        if (!this.exitoso){
            throw new Error('No se pudo obtener el valor de la respuesta.')
        }
        return this._resultado as T;
    }

    public static ok<T>(resultado?: T, descripcion: string = 'Operación exitosa'): Result<T>{
        return new Result<T>(true, descripcion, resultado);
    }

    public static fallo<T>(descripcion: string): Result<T>{
        return new Result<T>(false, descripcion);
    }
}