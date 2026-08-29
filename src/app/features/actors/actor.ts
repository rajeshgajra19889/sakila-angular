export interface Actor {
    actor_id: number;
    first_name: string;
    last_name: string;
}

export interface ActorDetail extends Actor {
    films: { film_id: number; title: string }[];
}

export interface ActorPage {
    items: Actor[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ActorInput {
    first_name: string;
    last_name: string;
}