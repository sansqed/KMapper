## Tips
### Prompting
It is recommended to follow OpenAI's [prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering/prompt-engineering). From testing, these strategies worked best:
1. **Be thorough with the prompt.** Using longer prompts that describe the structure of the input text, the ideal output, and other strategies generally resulted in better concept maps.
2. **Provide the model with a role.** Giving GPT models a role allow it to use its own analysis to generate better concept maps. In KMapper, it is recommended to use `You are an expert in Natural Language Processing` or other similar roles.
3. **Describe the logical structure of the input text.** This guides GPT into how the different levels of headings and bullet points relate with one another. For KMapper, it is assumed that deeper levels of bullet points provide more context to the parent bullet point.
4. **Split complex tasks into simpler subtasks.** This can be done by enumerating specific steps that the model must do to achieve the desired result. In the case of KMapper, asking GPT to summarize the text before attempting to extract the concept-relation-concept triples resulted in a more comprehensive result. My hypothesis is that it has a hard time understanding bullet points since its grammar is incomplete. 
5. **Describe the ideal result of GPT and provide context for its use.** This helps the GPT model construct a response befitting its use case. For KMapper, it is best to instruct GPT that the triples will be used for concept maps.
6. **Instruct the model to consider all possible triples and to process the entirety of the input.** According to OpenAI, GPT models tend to stop too early when the document input is large. This prompt strategy forces GPT to not generate the triples prematurely.
7. **Provide examples using few-shot prompting.** This will guide the GPT model into the generating the ideal triples. Note that examples should not be included in the actual prompt, but rather at the `OpenAI examples` settings. More details can be found in the next section.

Additionally, there are parts of the prompt that are **REQUIRED** in KMapper.
1. **Instruct the model to return a JSON with keys `concept1, relation, concept2`.** Since KMapper relies on the response to be in JSON format with the specified keys for downstream processes, it is important to include these in the prompt. OpenAI also checks if the prompt contains `JSON`, otherwise it will return an error.

The prompt that yielded the best result is
```
You are an expert in Natural Language Processing. You will be given a Markdown document containing academic notes of a particular topic. The document may contain bullet points that are not in proper English Grammar.

Your task is to extract relevant concept-relation-concept triples from the provided document. Follow these steps:

Step 1 - From the given document, form complete and simple English sentences. Be as thorough as possible; do not summarize and do not leave out concepts and details. The sentences must also be simple such that the subject and objects of the verb are clearly indicated. Consider the parent and child bullet points in completing incomplete phrases. Note the concepts that reoccur throughout the bullet points since these are important.

Step 2 - Using the generated complete English sentences, extract concept-relation-concept triples or subject-verb-object triples. Again, note the concepts that reoccur throughout the sentences. Be sure to extract all possible triples; do not leave out details. Each concept must be atomic - in other words, a single idea or noun phrase. The relation can be a verb phrase, or anything that describes the relationship between the concepts. The concepts in the bullet points are all related, thus find a way to connect all these concepts with each other.

Step 3 - Review the generated triples and infer relations between concepts that have no relations yet. Make sure that the relations you inferred are logical, consistent, and true. Do not make up your own facts. Instead, consult your knowledge base. Think it carefully, do not rush. Include these inferred relationships in the triples. Keep in mind that 

Step 4 - Again, review the generated triples and resolve concepts that are semantically similar. This means that if 2 concepts are semnantically similar, they are just the same concept. 

The triples will be used in creating a concept map so make it as simple as possible but still retain the idea. Also make sure that the triples come from the given bullet points and comprehensible. Don't make up facts or relations that are not in the given bullet points. Instead, think step-by-step by analyzing the given bullet points. 

Be sure to process the entirety of the given document - in other words extract all possible triples until the end of the document before generating the triples.

Return a JSON object containg the triples with the keys: concept1, relation, concept2.
```

### Few-shot prompting
Few-shot prompting is a prompt engineering technique that uses examples to guide the GPT models in the ideal result. You can read more about it [here](https://platform.openai.com/docs/guides/prompt-engineering/tactic-provide-examples).

Each example in the `OpenAI examples` setting is composed of a `Prompt` and a `Completion`. 
- Prompts are the raw Markdown text of a note. You may copy and paste your notes from here.
- Completions are the expected concept-relation-concept triples contained in the corresponding prompt. For user convenience, these triples are separated by a semi-colon (`;`) and will be transformed into a JavaScript object before attaching to the GPT conversation. 

#### Recommended examples
Copy these examples into the OpenAI examples settings.

**Example 1**
Prompt:
```
# Chapter 2:  Operating-System  Structures
## Operating System Services
- Operating systems provide an environment for execution of programs and services to programs and users
- One set of operating-system services provides functions that are helpful to the user:
	- **User interface** - Almost all operating systems have a user interface (UI).
		- Varies between **Command-Line (CLI)**, **Graphics User Interface (GUI) Batch**
	- **Program execution** - The system must be able to load a program into  memory and to run that program, end execution, either normally or  abnormally (indicating error)
	- **I/O operations** -  A running program may require I/O, which may involve a file or an I/O device
	- **File-system manipulation** -  The file system is of particular interest. Programs need to read and write files and directories, create and delete  them, search them, list file Information, permission management.
	- **Communications** – Processes may exchange information, on the same computer or between computers over a network
		- Communications may be via shared memory or through message passing (packets moved by the OS)
	- **Error detection** – OS needs to be constantly aware of possible errors
		- May occur in the CPU and memory hardware, in I/O devices, in user program
		- For each type of error, OS should take the appropriate action to ensure correct and consistent computing
	- Debugging facilities can greatly enhance the user’s and programmer’s abilities to efficiently use the system
- Another set of OS functions exists for ensuring the efficient operation of the system itself via resource sharing
	- **Resource allocation -** When  multiple users or multiple jobs running concurrently, resources must be allocated to each of them
		- Many types of resources -  Some (such as CPU cycles, main memory,  and file storage) may have special allocation code, others (such as I/O  devices) may have general request and release code
	- **Accounting -** To keep track of which users use how much and what kinds of computer resources
	- **Protection and security -** The owners of information stored in a multiuser  or networked computer system may want to control use of that information,  concurrent processes should not interfere with each other
		- **Protection** involves ensuring that all access to system resources is controlled
		- **Security** of the system from outsiders requires user authentication, extends to defending external I/O devices from invalid access attempts
		- If a system is to be protected and secure, precautions must be instituted throughout it. A chain is only as strong as its weakest link.
### User Operating System Interface - CLI
- Command Line Interface (CLI) or **command interpreter** allows direct command entry
	- Sometimes implemented in kernel, sometimes by systems program
	- Sometimes multiple flavors implemented – **shells**
	- Primarily fetches a command from user and executes it
	- Sometimes commands built-in, sometimes just names of programs
		- If the latter, adding new features doesn’t require shell modification
### **User Operating System Interface - GUI**
- User-friendly **desktop** metaphor interface
	- Usually mouse, keyboard, and monitor
	- **Icons** represent files, programs, actions, etc
	- Various mouse buttons over objects in the interface cause various actions (provide information, options, execute function, open directory  (known as a **folder**)
	- Invented at Xerox PARC
- Many systems now include both CLI and GUI interfaces
	- Microsoft Windows is GUI with CLI “command” shell
	- Apple Mac OS X as “Aqua” GUI interface with UNIX kernel underneath and shells available
	- Solaris is CLI with optional GUI interfaces (Java Desktop, KDE)
### System Calls
- Programming interface to the services provided by the OS
- Typically written in a high-level language (C or C++)
- Mostly accessed by programs via a high-level **Application Program Interface (API)** rather than direct system call use
- Three most common APIs are Win32 API for Windows, POSIX API  for POSIX-based systems (including virtually all versions of UNIX,  Linux, and Mac OS X), and Java API for the Java virtual machine  (JVM)
- Why use APIs rather than system calls?
	- (Note that the system-call names used throughout this text are  generic)
#### Example of Standard API
- Consider the ReadFile() function in the    
- Win32 API—a function for reading from a file
- A description of the parameters passed to ReadFile()
	- HANDLE file—the file to be read
	- LPVOID buffer—a buffer where the data will be read into and written from
	- DWORD bytesToRead—the number of bytes to be read into the buffer
	- LPDWORD bytesRead—the number of bytes read during the last read
	- LPOVERLAPPED ovl—indicates if overlapped I/O is being used
#### System Call Implementation
- Typically, a number associated with each system call
	- System-call interface maintains a table indexed according to these numbers
- The system call interface invokes intended system call in OS kernel and returns status of the system call and any return values
- The caller need know nothing about how the system call is implemented
	- Just needs to obey API and understand what OS will do as a result call
	- Most details of  OS interface hidden from programmer by API
		- Managed by run-time support library (set of functions built into libraries included with compiler)
#### Standard C Library Example
- C program invoking printf() library call, which calls write() system call
#### System Call Parameter Passing
- Often, more information is required than simply identity of desired system call
	- Exact type and amount of information vary according to OS and call
- Three general methods used to pass parameters to the OS
	- Simplest:  pass the parameters in registers
		- In some cases, may be more parameters than registers
	- Parameters stored in a block, or table, in memory, and address of block passed as a parameter in a register
		- This approach taken by Linux and Solaris
	- Parameters placed, or pushed, onto the stack by the program and popped off the stack by the operating system
	- Block and stack methods do not limit the number or length of parameters being passed
#### Types of System Calls
- Process control
	- end, abort
	- load, execute
	- create process, terminate process
	- get process attributes, set process attributes
	- wait for time
	- wait event, signal event
	- allocate and free memory
- File management
	- create file, delete file
	- open, close file
	- read, write, reposition
	- get and set file attributes
- Device management
	- request device, release device
	- read, write, reposition
	- get device attributes, set device attributes
	- logically attach or detach devices
- Information maintenance
	- get time or date, set time or date
	- get system data, set system data
	- get and set process, file, or device attributes
- Communications
	- create, delete communication connection
	- send, receive messages
	- transfer status information
	- attach and detach remote devices
#### Example: MS-DOS
- Single-tasking
- Shell invoked when system booted
- Simple method to run program
	- No process created
- Single memory space
- Loads program into memory, overwriting all but the kernel
- Program exit -> shell reloaded
#### Example: FreeBSD
- Unix variant
- Multitasking
- User login -> invoke user’s choice of shell
- Shell executes fork() system call to create process
	- Executes exec() to load program into process
	- Shell waits for process to terminate or continues with user commands
- Process exits with code of 0 – no error or > 0 – error code
## System Programs
- System programs provide a convenient environment for program development and execution.  They can be divided into:
	- File manipulation
	- Status information
	- File modification
	- Programming language support
	- Program loading and execution
	- Communications
	- Application programs
- Most users’ view of the operation system is defined by system programs, not the actual system calls
- Provide a convenient environment for program development and execution
	- Some of them are simply user interfaces to system calls; others are considerably more complex
- **File management** - Create, delete, copy, rename, print, dump, list, and generally manipulate files and directories
- **Status information**
	- Some ask the system for info - date, time, amount of available memory, disk space, number of users
	- Others provide detailed performance, logging, and debugging information
	- Typically, these programs format and print the output to the terminal or other output devices
	- Some systems implement  a registry - used to store and retrieve configuration information
- **File modification**
	- Text editors to create and modify files
	- Special commands to search contents of files or perform transformations of the text
- **Programming-language support** - Compilers, assemblers, debuggers and interpreters sometimes provided
- **Program loading and execution**- Absolute loaders, relocatable loaders, linkage editors, and overlay-loaders, debugging systems for  higher-level and machine language
- **Communications** - Provide the mechanism for creating virtual connections among processes, users, and computer systems
	- Allow users to send messages to one another’s screens, browse  web pages, send electronic-mail messages, log in remotely,  transfer files from one machine to another
## **Operating System Design and Implementation**
- Design and Implementation of OS not “solvable”, but some approaches have proven successful
- Internal structure of different Operating Systems  can vary widely
- Start by defining goals and specifications
- Affected by choice of hardware, type of system
- User goals and System goals
	- User goals – operating system should be convenient to use, easy to learn, reliable, safe, and fast
	- System goals – operating system should be easy to design, implement, and maintain, as well as flexible, reliable, error-free,  and efficient
- Important principle to separate
	- **Policy**:  What will be done?   
	- **Mechanism:** How to do it?
- Mechanisms determine how to do something, policies decide what will be done
	- The separation of policy from mechanism is a very important principle, it allows maximum flexibility if policy decisions are to be  changed later
### Simple Structure
- MS-DOS – written to provide the most functionality in the least space
	- Not divided into modules
	- Although MS-DOS has some structure, its interfaces and levels of functionality are not well separated
### Layered Approach
- The operating system is divided into a number of layers (levels), each built on top of lower layers.  The bottom layer (layer 0), is the  hardware; the highest (layer N) is the user interface.
- With modularity, layers are selected such that each uses functions (operations) and services of only lower-level layers
### UNIX
- UNIX – limited by hardware functionality, the original UNIX operating system had limited structuring.  The UNIX OS consists of two  separable parts
	- Systems programs
	- The kernel
		- Consists of everything below the system-call interface and above the physical hardware
		- Provides the file system, CPU scheduling, memory management, and other operating-system functions; a large  number of functions for one level
### Microkernel System Structure
- Moves as much from the kernel into “user” space
- Communication takes place between user modules using message passing
- Benefits:
	- Easier to extend a microkernel
	- Easier to port the operating system to new architectures
	- More reliable (less code is running in kernel mode)
	- More secure
- Detriments:
	- Performance overhead of user space to kernel space communication
### Modules
- Most modern operating systems implement kernel modules
	- Uses object-oriented approach
	- Each core component is separate
	- Each talks to the others over known interfaces
	- Each is loadable as needed within the kernel
- Overall, similar to layers but with more flexible
### Virtual Machines
- A **virtual machine** takes the layered approach to its logical conclusion.  It treats hardware and the operating system kernel as  though they were all hardware.
- A virtual machine provides an interface identical to the underlying bare hardware.
- The operating system **host** creates the illusion that a process has its own processor and (virtual memory).
- Each **guest** provided with a (virtual) copy of underlying computer.
#### Virtual Machines History and Benefits
- First appeared commercially in IBM mainframes in 1972
- Fundamentally, multiple execution environments (different operating systems) can share the same hardware
- Protect from each other
- Some sharing of file can be permitted, controlled
- Commutate with each other, other physical systems via networking
- Useful for development, testing
- **Consolidation** of many low-resource use systems onto fewer busier systems
- “Open Virtual Machine Format”, standard format of virtual machines, allows a VM to run within many different virtual machine (host)  platforms
### Para-virtualization
- Presents guest with system similar but not identical to hardware
- Guest must be modified to run on paravirtualized hardware
- Guest can be an OS, or in the case of Solaris 10 applications running in **containers**
#### Virtualization Implementation
- Difficult to implement – must provide an exact duplicate of underlying machine
	- Typically runs in user mode, creates virtual user mode and virtual kernel mode
- Timing can be an issue – slower than real machine
- Hardware support needed
	- More support-> better virtualization
	- i.e. AMD provides “host” and “guest” modes
## Operating-System Debugging
- **Debugging** is finding and fixing errors, or **bugs**    
- OSes generate **log files** containing error information  
- Failure of an application can generate **core dump** file capturing memory of the process
- Operating system failure can generate **crash dump** file containing kernel memory
- Beyond crashes, performance tuning can optimize system performance
- Kernighan’s Law: “Debugging is twice as hard as writing the code in the  first place. Therefore, if you write the code as cleverly as possible, you  are, by definition, not smart enough to debug it.”
- DTrace tool in Solaris, FreeBSD, Mac OS X allows live instrumentation on production systems
	- **Probes** fire when code is executed, capturing state data and sending it to consumers of those probes
## Operating System Generation
-  Operating systems are designed to run on any of a class of machines; the system must be configured for each specific computer site
- SYSGEN program obtains information concerning the specific configuration of the hardware system
- Booting – starting a computer by loading the kernel
- Bootstrap program – code stored in ROM that is able to locate the kernel, load it into memory, and start its execution
## System Boot
- Operating system must be made available to hardware so hardware can start it
	- Small piece of code – **bootstrap loader**, locates the kernel, loads it into memory, and starts it
	- Sometimes two-step process where **boot block** at fixed location loads bootstrap loader
	- When power initialized on system, execution starts at a fixed memory location
		- Firmware used to hold initial boot code
```

Completion:
```
Operating systems; provide; An environment for execution of programs and services to programs and users
Operating systems; has service; User interface
User interface; can be; Command-Line
Command-Line; aka; CLI
Command-Line; aka; Command interpreter
User interface; can be; Graphics User Interface 
Graphics User Interface; aka; GUI
User interface; can be; Batch 
Operating systems; has service; Program execution
Program execution; Loads, runs, and ends;  Program
Operating systems; has service; I/O operation
Program; may require; I/O operation
Operating systems; has service; File-system manipulation
File-system manipulation; manipulate; Files and directories
Operating systems; has service; Communication
Communication; may be via; Shared memory or message passing
Operating systems; has service; Error detection
Operating systems; has service; Resource allocation
Operating systems; has service; Accounting
Accounting; keeps track of; Computer resources
Operating systems; has service; Protection and security
Protection; control access to; Computer resources
Security; defend; I/O devices
CLI; allows; Direct command entry
CLI; implemented by; Kernel
CLI; implemented by; Systems program
CLI; implemented by; Shells
CLI; fetches and executes; Command from user
GUI; is a; User-friendly desktop metaphor interface
Operating system; provides; System calls
System calls; typically written in; A high-level language
System calls; accessed using; Application Program Interface (API)
System call interface; invokes; System call
System call interface; returns; Status of system call and any other values
System call interface; returns; Status of system call and any other values
System call; has; Parameter
System call; has types; Process control 
System call; has types; File management
System call; has types; Device management
System call; has types; Information maintenance
System call; has types; Communications
System programs; provide; A convenient environment for program development and execution
System programs; divided into; File manipulation
System programs; divided into; Status information
System programs; divided into; File modification
System programs; divided into; Programming language support
System programs; divided into; Program loading and execution
System programs; divided into; Communications
System programs; divided into; Application programs
System programs; provided; A convenient environment for program development and execution
File modification; use; Text editors
Programming language support; includes;  Compilers, assemblers, debuggers and interpreters sometimes provided
Program loading and execution; includes; Absolute loaders, relocatable loaders, linkage editors, and overlay-loaders, debugging systems for  higher-level and machine language
Communications; provide; Mechanism for creating virtual connections among processes, users, and computer systems
Operating systems; has varied; Internal structure
Operating System Design and Implementation;; User goals
Operating System Design and Implementation;; System goals
User goals; include; Convenient to use, easy to learn, reliable, safe, and fast
System goals; include; Easy to design, implement, and maintain, as well as flexible, reliable, error-free, and efficient
Operating System Design and Implementation; considers; Policy
Operating System Design and Implementation; considers; Mechanism
Mechanism; determines; How to do something
Policy; decides; What will be done
Operating systems; divided into; Layers (levels)
Layers (levels); built on top of; lower layers
UNIX; consist of; Systems programs
UNIX; consist of; Kernel
Kernel; consist of; Everything below the system-call interface and above the physical hardware
Kernel; provides; The file system, CPU scheduling, memory management, and other operating-system functions
Operating systems; implement; Kernel modules
Virtual machines; treats; Hardware and the operating system kernel as  though they were all hardware.
Virtual machines; provide; An interface identical to the underlying bare hardware
Virtual machines; first appeared; in IBM mainframes in 1972
Debugging; finds and fixes; Errors or bugs
Operating systems; generate; Log files
Log files; contains; Error information
Log files; can be; Core dump
Core dump; generated by; Failure of an application
Core dump; contains; Memory of the process
Log files; can be; Crash dump
Crash dump; generated by; Operating system failure
Crash dump; contains; Kernel memory
Booting; loads; Kernel
Bootstrap programs; does; Booting
Bootstrap loader; locates, loads, and starts; Kernel
Boot block; loads; Bootstrap loader
```

**Example 2**
Prompt:
```
# Chapter 1- Introduction
## Topics covered
- Professional software development
	- What is meant by software engineering.
- Software engineering ethics
	- A brief introduction to ethical issues that affect software engineering.
- Case studies
	- An introduction to three examples that are used in later chapters in the book.
## Software engineering
- The economies of ALL developed nations are dependent on software.
- More and more systems are software controlled
- Software engineering is concerned with theories, methods and tools for professional software  development.
- Expenditure on software represents a significant fraction of GNP in all developed countries.
## Software costs
- Software costs often dominate computer system costs.
- The costs of software on a PC are often greater than the  hardware cost.
- Software costs more to maintain than it does to develop.  For systems with a long life, maintenance costs may be  several times development costs.
- Software engineering is concerned with cost-effective software development.
## Software products
- Generic products
	- Stand-alone systems that are marketed and sold to any customer who wishes to buy them.
	- Examples – PC software such as graphics programs, project management tools; CAD software; software for specific markets  such as appointments systems for dentists.
- Customized products
	- Software that is commissioned by a specific customer to meet their own needs.
	- Examples – embedded control systems, air traffic control software, traffic monitoring systems.
## Product specification
- Generic products
	- The specification of what the software should do is owned by the  software developer and decisions on software change are made  by the developer.
- Customized products
	- The specification of what the software should do is owned by the  customer for the software and they make decisions on software  changes that are required.
## Frequently asked questions about software  engineering
- What is software?
	- Computer  programs  and  associated  documentation.  Software  products  may  be  developed  for  a  particular  customer or may be developed for a general market.
- What are the attributes of good software? 
	- Good software should deliver the required functionality and performance to the user and should be maintainable, dependable and usable.
- What is software engineering?
	- Software engineering is an engineering discipline that is  concerned with all aspects of software production.
- What are the fundamental software engineering activities?
	- Software specification, software development, software validation and software evolution.
- What is the difference between software engineering and computer science?
	- Computer science focuses on theory and fundamentals; software engineering is concerned with the practicalities of developing and delivering useful software.
- What is the difference between software engineering and system engineering?
	- System engineering is concerned with all aspects of computer-based systems development including hardware, software and process engineering. Software engineering is part of this more general process
- What are the key challenges facing software engineering?
	- Coping with increasing diversity, demands for reduced delivery times and developing trustworthy software.
- What are the costs of software engineering?
	- Roughly 60% of software costs are development costs, 40% are testing costs. For custom software, evolution costs often exceed development costs.
- What are the best software engineering techniques and methods?
	- While all software projects have to be professionally managed and developed, different techniques are appropriate for different types of system. For example, games should always be developed using a series of prototypes whereas safety critical control systems require a complete and analyzable specification to be developed. You can’t, therefore, say that one method is better than another.
- What differences has the web made to software engineering?
	- The web has led to the availability of software services and the possibility of developing highly distributed service-based systems. Web-based systems development has led to important advances in programming languages and software reuse.
## Essential attributes of good software
- Maintainability
	- Software should be written in such a way so that it can evolve to  meet the  changing  needs  of customers.  This  is a critical  attribute  because  software  change  is  an  inevitable  requirement  of  a  changing business environment.
- Dependability and  security
	- Software  dependability  range  of  characteristics  includes  a  including  reliability,  security  and  safety.  Dependable  software  should  not  cause  physical  or  economic  damage  in  the  event  of  system  failure.  Malicious  users  should  not  be    able  to  access  or  damage the system.
- Efficiency
	- Software should not make wasteful use of system resources such  as  memory  and  processor  cycles.  Efficiency  therefore  includes  responsiveness, processing time, memory utilisation, etc.
- Acceptability
	- Software  must  be  acceptable  to  the  type  of  users  for  which  it  is  designed. This means that it must be understandable, usable and  compatible with other systems that they use.
## Software engineering
- Software engineering is an engineering discipline that is  concerned with all aspects of software production from  the early stages of system specification through to  maintaining the system after it has gone into use.
- Engineering discipline
	- Using appropriate theories and methods to solve problems  bearing in mind organizational and financial constraints.
- All aspects of software production
	- Not just technical process of development. Also project management and the development of tools, methods etc. to  support software production.
## Importance of software engineering
- More and more, individuals and society rely on advanced software systems. We need to be able to produce  reliable and trustworthy systems economically and  quickly.
- It is usually cheaper, in the long run, to use software  engineering methods and techniques for software  systems rather than just write the programs as if it was a  personal programming project. For most types of  system, the majority of costs are the costs of changing  the software after it has gone into use.
## Software process activities
- Software specification, where customers and engineers define the software that is to be produced and the  constraints on its operation.
- Software development, where the software is designed and programmed.
- Software validation, where the software is checked to ensure that it is what the customer requires.
- Software evolution, where the software is modified to  reflect changing customer and market requirements.
## General issues that affect most software
- Heterogeneity
	- Increasingly, systems are required to operate as distributed systems across networks that include different types of computer  and mobile devices.
- Business and social change
	- Business and society are changing incredibly quickly as emerging economies develop and new technologies become  available. They need to be able to change their existing software  and to rapidly develop new software.
- Security and trust
	- As software is intertwined with all aspects of our lives, it is essential that we can trust that software.
## Software engineering diversity
- There are many different types of software system and  there is no universal set of software techniques that is  applicable to all of these.
- The software engineering methods and tools used depend on the type of application being developed, the  requirements of the customer and the background of the  development team.
## Application types
- Stand-alone applications
	- These are application systems that run on a local computer, such as a PC. They include all necessary functionality and do  not need to be connected to a network.
- Interactive transaction-based applications
	- Applications that execute on a remote computer and are accessed by users from their own PCs or terminals. These  include web applications such as e-commerce applications.
- Embedded control systems
	- These are software control systems that control and manage  hardware devices. Numerically, there are probably more  embedded systems than any other type of system.
- Batch processing systems
	- These are business systems that are designed to process data  in large batches. They process large numbers of individual  inputs to create corresponding outputs.
- Entertainment systems
	- These are systems that are primarily for personal use and which are intended to entertain the user.
- Systems for modeling and simulation
	- These are systems that are developed by scientists and engineers to model physical processes or situations, which  include many, separate, interacting objects.
- Data collection systems
	- These are systems that collect data from their environment using a set of sensors and send that data to other systems for  processing.
- Systems of systems
	- These are systems that are composed of a number of other software systems.
## Software engineering fundamentals
- Some fundamental principles apply to all types of  software system, irrespective of the development  techniques used:
	- Systems should be developed using a managed and understood  development process. Of course, different processes are used  for different types of software.
	- Dependability and performance are important for all types of system.
	- Understanding and managing the software specification and  requirements (what the software should do) are important.
	- Where appropriate, you should reuse software that has already been developed rather than write new software.
## Software engineering and the web
- The Web is now a platform for running application and  organizations are increasingly developing web-based  systems rather than local systems.
- Web services (discussed in Chapter 19) allow application functionality to be accessed over the web.
- Cloud computing is an approach to the provision of computer services where applications run remotely on  the ‘cloud’.
	- Users do not buy software buy pay according to use.
## Web software engineering
- Software reuse is the dominant approach for constructing web-based systems.
	- When building these systems, you think about how you can assemble them from pre-existing software components and systems.
- Web-based systems should be developed and delivered incrementally.
	- It is now generally recognized that it is impractical to specify all the requirements for such systems in advance.
- User interfaces are constrained by the capabilities of web browsers.
	- Technologies such as AJAX allow rich interfaces to be created within a web browser but are still difficult to use. Web forms with local  scripting are more commonly used.
## Web-based software engineering
- Web-based systems are complex distributed systems  but the fundamental principles of software engineering  discussed previously are as applicable to them as they  are to any other types of system.
- The fundamental ideas of software engineering, discussed in the previous section, apply to web-based  software in the same way that they apply to other types  of software system.
## Key points
- Software engineering is an engineering discipline that is concerned with all aspects of software production.
- Essential software product attributes are maintainability,  dependability and security, efficiency and acceptability.
- The high-level activities of specification, development, validation and evolution are part of all software  processes.
- The fundamental notions of software engineering are universally applicable to all types of system  development.
- There are many different types of system and each  requires appropriate software engineering tools and  techniques for their development.
- The fundamental ideas of software engineering are applicable to all types of software system.
## Software engineering ethics
- Software engineering involves wider responsibilities than simply the application of technical skills.
- Software engineers must behave in an honest and ethically responsible way if they are to be respected as  professionals.
- Ethical behaviour is more than simply upholding the law  but involves following a set of principles that are morally  correct.
## Issues of professional responsibility
- Confidentiality
	- Engineers should normally respect the confidentiality of their  employers or clients irrespective of whether or not a formal  confidentiality agreement has been signed.
- Competence
	- Engineers should not misrepresent their level of competence.  They should not knowingly accept work which is outwith their  competence.
- Intellectual property rights
	- Engineers should be aware of local laws governing the use of intellectual property such as patents, copyright, etc. They should  be careful to ensure that the intellectual property of employers  and clients is protected.
- Computer misuse
	- Software engineers should not use their technical skills to misuse other people’s computers. Computer misuse ranges from  relatively trivial (game playing on an employer’s machine, say) to  extremely serious (dissemination of viruses).
## ACM/IEEE Code of Ethics
- The professional societies in the US have cooperated to produce a code of ethical practice.
- Members of these organisations sign up to the code of practice when they join.
- The Code contains eight Principles related to the  behaviour of and decisions made by professional  software engineers, including practitioners, educators,  managers, supervisors and policy makers, as well as  trainees and students of the profession.
## Rationale for the code of ethics
- Computers have a central and growing role in commerce, industry, government, medicine, education, entertainment and  society at large. Software engineers are those who contribute by  direct participation or by teaching, to the analysis, specification,  design, development, certification, maintenance and testing of  software systems.
- Because of their roles in developing software systems, software  engineers have significant opportunities to do good or cause  harm, to enable others to do good or cause harm, or to influence  others to do good or cause harm. To ensure, as much as  possible, that their efforts will be used for good, software  engineers must commit themselves to making software  engineering a beneficial and respected profession.
## The ACM/IEEE Code of Ethics
- **Software Engineering Code of Ethics and Professional Practice**
- ACM/IEEE-CS Joint Task Force on Software Engineering Ethics and Professional Practices
- **PREAMBLE** 
- The short version of the code summarizes aspirations at a high level of the abstraction; the  clauses that are included in the full version give examples and details of how these  aspirations change the way we act as software engineering professionals. Without the  aspirations, the details can become legalistic and tedious; without the details, the  aspirations can become high sounding but empty; together, the aspirations and the details  form a cohesive code.
- Software engineers shall commit themselves to making the analysis, specification, design,  development, testing and maintenance of software a beneficial and respected profession. In  accordance with their commitment to the health, safety and welfare of the public, software  engineers shall adhere to the following Eight Principles:
## Ethical principles
1. PUBLIC - Software engineers shall act consistently with the public interest.
2. CLIENT AND EMPLOYER - Software engineers shall act in a manner that is in the best  interests of their client and employer consistent with the public interest.
3. PRODUCT - Software engineers shall ensure that their products and related  modifications meet the highest professional standards possible.
4. JUDGMENT - Software engineers shall maintain integrity and independence in their  professional judgment.
5. MANAGEMENT - Software engineering managers and leaders shall subscribe to and  promote an ethical approach to the management of software development and  maintenance.
6. PROFESSION - Software engineers shall advance the integrity and reputation of the  profession consistent with the public interest.
7. COLLEAGUES - Software engineers shall be fair to and supportive of their colleagues.
8. SELF - Software engineers shall participate in lifelong learning regarding the practice of  their profession and shall promote an ethical approach to the practice of the profession.
## Ethical dilemmas
- Disagreement in principle with the policies of senior management.
- Your employer acts in an unethical way and releases a  safety-critical system without finishing the testing of the  system.
- Participation in the development of military weapons systems or nuclear systems.
## Case studies
- A personal insulin pump
	-  An embedded system in an insulin pump used by diabetics to maintain blood glucose control.
- A mental health case patient management system
	-  A system used to maintain records of people receiving care for mental health problems.
- A wilderness weather station
	-  A data collection system that collects data about weather conditions in remote areas.
### Insulin pump control system
- Collects data from a blood sugar sensor and calculates the amount of insulin required to be injected.
- Calculation based on the rate of change of blood sugar levels.
- Sends signals to a micro-pump to deliver the correct dose of insulin.
- Safety-critical system as low blood sugars can lead to brain malfunctioning, coma and death; high-blood sugar  levels have long-term consequences such as eye and  kidney damage.
#### Essential high-level requirements
- The system shall be available to deliver insulin when required.
- The system shall perform reliably and deliver the correct  amount of insulin to counteract the current level of blood  sugar.
- The system must therefore be designed and implemented to ensure that the system always meets  these requirements.
### A patient information system for mental health  care
- A patient information system to support mental health  care is a medical information system that maintains  information about patients suffering from mental health  problems and the treatments that they have received.
- Most mental health patients do not require dedicated  hospital treatment but need to attend specialist clinics  regularly where they can meet a doctor who has detailed  knowledge of their problems.
- To make it easier for patients to attend, these clinics are  not just run in hospitals. They may also be held in local  medical practices or community centres.
#### MHC-PMS
- The MHC-PMS (Mental Health Care-Patient Management System) is an information system that is  intended for use in clinics.
- It makes use of a centralized database of patient information but has also been designed to run on a PC,  so that it may be accessed and used from sites that do  not have secure network connectivity.
- When the local systems have secure network access, they use patient information in the database but they can  download and use local copies of patient records when  they are disconnected.
#### MHC-PMS goals
- To generate management information that allows health  service managers to assess performance against local  and government targets.
- To provide medical staff with timely information to support the treatment of patients.
#### MHC-PMS key features
- Individual care management
	- Clinicians can create records for patients, edit the information in  the system, view patient history, etc. The system supports data  summaries so that doctors can quickly learn about the key  problems and treatments that have been prescribed.
- Patient monitoring
	- The system monitors the records of patients that are involved in treatment and issues warnings if possible problems are detected.
- Administrative reporting
	- The system generates monthly management reports showing the  number of patients treated at each clinic, the number of patients  who have entered and left the care system, number of patients  sectioned, the drugs prescribed and their costs, etc.
#### MHC-PMS concerns
- Privacy
	- It is essential that patient information is confidential and is never  disclosed to anyone apart from authorised medical staff and the  patient themselves.
- Safety
	- Some mental illnesses cause patients to become suicidal or a  danger to other people. Wherever possible, the system should  warn medical staff about potentially suicidal or dangerous  patients.
	- The system must be available when needed otherwise safety may be compromised and it may be impossible to prescribe the  correct medication to patients.
### Wilderness weather station
- The government of a country with large areas of wilderness decides to deploy several hundred weather  stations in remote areas.
- Weather stations collect data from a set of instruments  that measure temperature and pressure, sunshine,  rainfall, wind speed and wind direction.
	- The weather station includes a number of instruments that  measure weather parameters such as the wind speed and  direction, the ground and air temperatures, the barometric  pressure and the rainfall over a 24-hour period. Each of these  instruments is controlled by a software system that takes  parameter readings periodically and manages the data collected  from the instruments.
#### Weather information system
- The weather station system
	- This is responsible for collecting weather data, carrying out some  initial data processing and transmitting it to the data management  system.
- The data management and archiving system
	- This system collects the data from all of the wilderness weather stations, carries out data processing and analysis and archives the  data.
- The station maintenance system
	- This system can communicate by satellite with all wilderness weather stations to monitor the health of these systems and provide  reports of problems.
#### Additional software functionality
- Monitor the instruments, power and communication hardware and report faults to the management system.
- Manage the system power, ensuring that batteries are  charged whenever the environmental conditions permit  but also that generators are shut down in potentially  damaging weather conditions, such as high wind.
- Support dynamic reconfiguration where parts of the  software are replaced with new versions and where  backup instruments are switched into the system in the  event of system failure.
### Key points
- Software engineers have responsibilities to the engineering profession and society. They should not  simply be concerned with technical issues.
- Professional societies publish codes of conduct which  set out the standards of behaviour expected of their  members.
- Three case studies are used in the book:
	- An embedded insulin pump control system  
	- A system for mental health care patient management  
	- A wilderness weather station
```

Completion:
```
Software engineering; is concerned with; Professional software development
Software costs; dominate; Computer system cost
Software engineering; is concerned with; Cost-effective software development
Software costs; are often greater than; Hardware costs
Software products; can be; Generic products
Generic products; are; Stand-alone systems that are marketed and sold to any customer who wishes to buy them
Generic products; includes; PC software such as graphics programs, project management tools, CAD software, software for specific markets  such as appointments systems for dentists.
Software products; can be; Customized products
Customized products; have; customer-owned specifications
Customer; make decisions on; Customized products
Software; includes; Computer  programs  and  associated  documentation
Software; should; Deliver the required functionality and performance to the user
Software; should be; Maintainable, dependable and usable.
Software engineering; is an; Engineering discipline 
Software engineering; is concerned with; Software production.
System engineering; is concerned with; All aspects of computer-based systems development
Software engineering; is part of; System engineering
Software engineering; faces; Coping with increasing diversity, demands for reduced delivery times and developing trustworthy software
Software costs; include; Development costs, testing costs, and evolution costs
Software products; have to be; Professionally managed and developed
Software; has; Maintainability
Maintainability; includes; Possibility to evolve to meet the changing needs of customers
Software; has; Dependability and security
Dependability and security; includes; reliability, security, and safety
Software; has; Efficiency
Efficiency; includes; Responsiveness, processing time, memory utilisation, etc.
Software; has; Acceptability
Acceptability; is; Acceptable  to  the  type  of  users  for  which  it  is  designed
Software production; includes; Technical process of development, project management, and the development of tools, methods etc.
Software engineering; reduces; Software costs
Software engineering; includes; Software specification, software development, software validation and software evolution
Software; suffers from; Heterogeneity, Business and social change, and Security and trust
Software engineering; depends on; Application types
Software engineering; depends on; The requirements of the customer and the background of the  development team
Application types; include; Stand-alone applications
Stand-alone applications; run on; Local computer
Stand-alone applications; includes; All necessary functionality 
Stand-alone applications; do not need; Internet connection
Application types; include; Interactive transaction-based applications
Interactive transaction-based applications; executed on; Remote computer
Interactive transaction-based applications; accessed using; PCs and terminals
Application types; include; Embedded control systems
Embedded control systems; control and manage; Hardware devices
Application types; include; Batch processing systems
Batch processing systems; process; Large batches of data
Application types; include; Entertainment systems
Entertainment systems; are used for; Entertaining the user
Application types; include; Systems for modeling and simulation
Systems for modeling and simulation; developed by; Scientists and engineers
Systems for modeling and simulation; model; Physical processes or situations
Application types; include; Data collection systems
Data collection systems; collect; Data
Data; sent to; Other systems
Data collection systems; use; Sensors
Application types; include; Systems of systems
Systems of systems; composed of; Other systems
Web; run; Web-based systems
Web; includes; Web services
Web services allow; Access to application functionality
Web; includes; Cloud computing
Cloud computing; run; Applications remotely
Web-based systems; uses; Software reuse
Software reuse; assembles; pre-existing software components and systems
Web-based systems; should be; Developed and delivered incrementally
Web-based systems; should be; User interface
User interface; constrained by; web browser
Web-based systems; are; Distributed systems
Web-based systems; apply; Software engineering
Software engineering; considers; Ethics
Ethics; involves; Upholding the law and following a set of principles that are morally correct
Professional responsibility; has issues; Confidentiality
Professional responsibility; has issues; Competence
Professional responsibility; has issues; Intellectual property rights
Professional responsibility; has issues; Computer misuse
Ethics;;ACM/IEEE Code of Ethics
Software engineers; must follow; ACM/IEEE Code of Ethics
Software engineering managers and leaders; must follow; ACM/IEEE Code of Ethics
Software engineers; must act with; Public interest
Software engineers; must act with; best interest of their client and employer
Software engineers; must meet; Highest professional standards
Software engineers; must maintain; Integrity and independence in their  professional judgment
Software engineering managers and leaders;  must promote; Ethical approach
Software engineers; must advance; The integrity and reputation of the  profession
Software engineers; must be; Fair to and supportive of their colleagues
Software engineers; must participate in; Lifelong learning
```