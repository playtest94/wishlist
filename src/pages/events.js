import { useState, useMemo } from 'react';


import { Inter } from 'next/font/google'

import * as EventTrack from "@/helpers/events"

import supabase from "@/helpers/supabase-client"

const inter = Inter({ subsets: ['latin'] })

export default function Events({ eventsData }) {
    const [detailData, setDetailData] = useState(false);
    const [events, setEvents] = useState(eventsData || []);


    const groupedEvents = useMemo(() => {
        if (!events) return []

        const groupedByDate = events.reduce((group, event) => {
            const { created_at } = event;
            const createdAt = new Date(created_at)
            // createdAt.setHours(createdAt.getHours() - 2)

            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const stringDate = new Intl.DateTimeFormat('es-ES', options).format(createdAt).toLocaleUpperCase()


            group[stringDate] = group[stringDate] ?? [];
            group[stringDate].push(event);
            return group;
        }, {});

        const groupedByParticipants = Object.keys(groupedByDate).map(key => {

            const groupedByParticipant = groupedByDate[key].reduce((group, event) => {
                const { Participants } = event;
                const name = Participants?.name ?? "Anonimo"
                group[name] = group[name] ?? [];
                group[name].push(event);
                return group;
            }, {});


            const groupedByParticipantArray = Object.keys(groupedByParticipant).map(participantName => {
                const events = groupedByParticipant[participantName]

                return { name: participantName, events, lastEventDate: events[0].created_at }

            })


            const groupedByParticipantArraySorted = groupedByParticipantArray.sort((a, b) => {
                const first = new Date(b.lastEventDate)
                const second = new Date(a.lastEventDate)
                return first.getTime() > second.getTime()
            })

            return {
                date: key, participants: groupedByParticipantArraySorted
            }

        })


        return groupedByParticipants
    }, [events])




    return (
        <>
            <main
                className={`${inter.className} p-5 gap-4`}
            >
                {groupedEvents.map(element => {
                    return <div key={element.date} className="p-5 mb-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <time className="text-lg font-semibold text-gray-900 dark:text-white">{element.date}</time>
                        <ol className="mt-3 divide-y divider-gray-200 dark:divide-gray-700">
                            {element.participants.map(participant => {
                                const options = { hour: "2-digit", minute: "2-digit" };
                                const lastDate = new Intl.DateTimeFormat('es-ES', options).format(new Date(participant.lastEventDate))
                                // const lastDate = participant.lastEventDate
                                return <li key={participant.name} onClick={() => setDetailData(participant)}>
                                    <div href="#" className="items-center block p-3 sm:flex hover:bg-gray-100 dark:hover:bg-gray-700">
                                        {/* <img className="w-12 h-12 mb-3 mr-3 rounded-full sm:mb-0" src="/docs/images/people/profile-picture-1.jpg" alt="Jese Leos image" /> */}
                                        <div className="text-gray-600 dark:text-gray-400">
                                            <div className="text-base font-normal">
                                                <span className="font-medium text-gray-900 dark:text-white">{participant.name}</span>
                                            </div>
                                            <div className="text-sm font-normal">{`Ultimo evento: ${lastDate}`}</div>
                                            <span className="inline-flex items-center text-xs font-normal text-gray-500 dark:text-gray-400">
                                                {`${participant.events.length} Eventos`}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            })}
                        </ol>
                    </div>
                })}

                {
                    detailData && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">

                            <div className="bg-white p-5 w-100 rounded shadow-lg max-h-full overflow-y-scroll min-w-full m-x:10	">

                                <div className="flex justify-end">
                                    <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gray-500 hover:bg-gray-400" onClick={() => setDetailData(null)}>
                                        X
                                    </button>
                                </div>
                                <h2 className="mb-2 text-md text-center font-semibold text-gray-900 mt-4 ">{`${detailData.name} - ${new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(detailData.lastEventDate))
                                    } `}</h2>


                                <ol class="relative border-l border-gray-200 dark:border-gray-700 mt-4">

                                    {detailData.events.toReversed().map(event => {
                                        const options = { hour: "2-digit", minute: "2-digit" };
                                        const time = new Intl.DateTimeFormat('es-ES', options).format(new Date(event.created_at))
                                        const title = EventTrack.EventTypesTitles[event.name]
                                        const desc = EventTrack.EventTypesDesc[event.name](event.Products?.name)
                                        return <li key={event.id} class="mb-10 ml-4">
                                            <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                            <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{time}</time>
                                            <h3 class="text-md font-semibold text-gray-900 dark:text-black">{title}</h3>
                                            <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                                {desc}
                                            </p>

                                        </li>
                                    })}


                                </ol>



                            </div>
                        </div>
                    )
                }

            </main >



        </>
    )
}


const fetchEvents = () => supabase
    .from('Events')
    .select('*,Participants(id,name), Products(id,name)')
    .order('created_at', { ascending: false })


export async function getServerSideProps(ctx) {
    const { data: dataEvents, error } = await fetchEvents()

    // dataEvents.length && console.log(dataEvents[0])
    // Pass data to the page via props
    return {
        props: {
            eventsData: dataEvents || null,
        }
    }
}