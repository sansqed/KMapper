export const sampleTriples = [
    {
        "subject": "Operating System",
        "relation": "is",
        "object": "a program that acts as an intermediary between a user of a computer and the computer hardware"
    },
    {
        "subject": "Operating System",
        "relation": "has goals",
        "object": "Execute user programs and make solving user problems easier"
    },
    {
        "subject": "Operating System",
        "relation": "has goals",
        "object": "Make the computer system convenient to use"
    },
    {
        "subject": "Operating System",
        "relation": "has goals",
        "object": "Use the computer hardware in an efficient manner"
    },
    {
        "subject": "Computer System",
        "relation": "can be divided into",
        "object": "Hardware, Operating system, Application programs, Users"
    },
    {
        "subject": "Hardware",
        "relation": "provides",
        "object": "basic computing resources like CPU, memory, I/O devices"
    },
    {
        "subject": "Operating system",
        "relation": "controls and coordinates",
        "object": "use of hardware among various applications and users"
    },
    {
        "subject": "Application programs",
        "relation": "define",
        "object": "the ways in which the system resources are used to solve the computing problems of the users"
    },
    {
        "subject": "Users",
        "relation": "include",
        "object": "People, machines, other computers"
    },
    {
        "subject": "Operating System",
        "relation": "is",
        "object": "a resource allocator that manages all resources and decides between conflicting requests for efficient and fair resource use"
    },
    {
        "subject": "Operating System",
        "relation": "is",
        "object": "a control program that controls execution of programs to prevent errors and improper use of the computer"
    },
    {
        "subject": "Computer Startup",
        "relation": "involves",
        "object": "loading a bootstrap program at power-up or reboot, typically stored in ROM or EPROM, generally known as firmware, that initializes all aspects of the system, loads operating system kernel, and starts execution"
    },
    {
        "subject": "Computer System Organization",
        "relation": "involves",
        "object": "One or more CPUs, device controllers connect through common bus providing access to shared memory, concurrent execution of CPUs and devices competing for memory cycles"
    },
    {
        "subject": "Interrupts",
        "relation": "transfer control to",
        "object": "the interrupt service routine generally, through the interrupt vector, which contains the addresses of all the service routines"
    },
    {
        "subject": "Interrupts",
        "relation": "are",
        "object": "interrupt driven and involve saving the address of the interrupted instruction, disabling incoming interrupts while another interrupt is being processed to prevent a lost interrupt, and handling traps caused by errors or user requests"
    },
    {
        "subject": "Interrupt Handling",
        "relation": "involves",
        "object": "The operating system preserving the state of the CPU by storing registers and the program counter, determining which type of interrupt has occurred through polling or vectored interrupt system, and taking appropriate action for each type of interrupt"
    }
]